"""Shared assertions, so every test checks status, body and schema the same way."""
import json
from pathlib import Path

from jsonschema import Draft7Validator

SCHEMA_DIR = Path(__file__).resolve().parent.parent / "schemas"
_cache = {}


def load_schema(name):
    if name not in _cache:
        _cache[name] = json.loads((SCHEMA_DIR / f"{name}.json").read_text(encoding="utf-8"))
    return _cache[name]


def assert_schema(response, schema_name):
    errors = sorted(Draft7Validator(load_schema(schema_name)).iter_errors(response.json), key=lambda e: list(e.path))
    assert not errors, f"Schema '{schema_name}' violations:\n" + "\n".join(
        f"  {'/'.join(map(str, e.path)) or '<root>'}: {e.message}" for e in errors[:10]
    )


def assert_response(response, code, message=None, schema=None, max_ms=None):
    """Check HTTP 200, the body's responseCode, optional exact message, schema and response time."""
    assert response.http_status == 200, f"HTTP {response.http_status}: {response.raw.text[:300]}"
    assert response.json is not None, f"Body is not JSON: {response.raw.text[:300]}"
    assert response.response_code == code, (
        f"Expected responseCode {code}, got {response.response_code}: {response.json}"
    )
    if message is not None:
        assert response.message == message, f"Expected message {message!r}, got {response.message!r}"
    if schema:
        assert_schema(response, schema)
    if max_ms is not None:
        assert response.elapsed_ms <= max_ms, f"Took {response.elapsed_ms:.0f} ms, limit {max_ms} ms"
