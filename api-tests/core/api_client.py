"""Thin wrapper around requests.Session: retries, timeouts, logging and a parsed response.

This API always answers HTTP 200 with a text/html content type; the real status is the
`responseCode` field in the JSON body. ApiResponse exposes both so tests can check each.
"""
import json
import logging
import time

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

log = logging.getLogger("api")

SENSITIVE_FIELDS = {"password"}


def _mask(data):
    if not isinstance(data, dict):
        return data
    return {k: ("***" if k in SENSITIVE_FIELDS else v) for k, v in data.items()}


class ApiResponse:
    def __init__(self, raw, elapsed_ms):
        self.raw = raw
        self.http_status = raw.status_code
        self.elapsed_ms = elapsed_ms
        self.headers = raw.headers
        try:
            self.json = json.loads(raw.text)
        except ValueError:
            self.json = None

    @property
    def response_code(self):
        return self.json.get("responseCode") if isinstance(self.json, dict) else None

    @property
    def message(self):
        return self.json.get("message") if isinstance(self.json, dict) else None

    def __repr__(self):
        return f"<ApiResponse http={self.http_status} code={self.response_code} {self.elapsed_ms:.0f}ms>"


class ApiClient:
    def __init__(self, base_url, timeout=30, retries=2):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "api-automation/1.0", "Accept": "application/json"})
        retry = Retry(
            total=retries,
            backoff_factor=1,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=None,  # retry every method; the site's writes are keyed by email
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

    def request(self, method, path, params=None, data=None):
        url = f"{self.base_url}{path}"
        log.info("--> %s %s params=%s data=%s", method, url, params, _mask(data))
        start = time.perf_counter()
        raw = self.session.request(method, url, params=params, data=data, timeout=self.timeout)
        response = ApiResponse(raw, (time.perf_counter() - start) * 1000)
        log.info("<-- %r %s", response, raw.text[:300])
        return response

    def get(self, path, params=None):
        return self.request("GET", path, params=params)

    def post(self, path, data=None):
        return self.request("POST", path, data=data)

    def put(self, path, data=None):
        return self.request("PUT", path, data=data)

    def delete(self, path, data=None):
        return self.request("DELETE", path, data=data)

    def close(self):
        self.session.close()
