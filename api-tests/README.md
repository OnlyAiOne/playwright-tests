# API Automation: automationexercise.com

Pytest + Requests suite covering all 14 APIs on the [API list](https://automationexercise.com/api_list), plus two API + Playwright UI integration checks.

## Setup (PyCharm or terminal)

```bash
cd api-tests
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
python -m playwright install chromium   # only for the `ui` tests
```

In PyCharm: open the repo, set the interpreter to `api-tests/.venv`, mark `api-tests` as Sources Root, and set the default test runner to pytest (Settings → Tools → Python Integrated Tools).

## Run

| Command | What runs |
|---|---|
| `pytest` | Everything (47 tests) |
| `pytest -m smoke` | Quick health check of each API |
| `pytest -m "not ui"` | API only, no browser |
| `pytest -m "not writes"` | Read-only: creates no accounts |
| `pytest -m negative` | Missing parameters, wrong methods, unknown users |
| `pytest -m contract` | JSON schema checks |
| `pytest -m account` / `auth` / `products` / `search` | One area |
| `pytest -n auto` | Parallel (after `pip install pytest-xdist`); every test makes its own user |
| `pytest --reruns 1` | Retry a failed test once (used in CI against a shared prod site) |

Reports go to `reports/api-report.html` (self-contained HTML) and `reports/junit.xml` (CI, Jira, Jenkins).

## Configuration

Set as environment variables (see [.env.example](.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `API_ENV` | `prod` | Picks a base URL from `config/settings.py` |
| `API_BASE_URL` | – | Overrides the base URL |
| `API_TIMEOUT` | `30` | Request timeout, seconds |
| `API_RETRIES` | `2` | Retries on connection errors and 429/5xx |
| `API_MAX_MS` | `5000` | Response-time limit checked by smoke tests |
| `API_ALLOW_WRITES` | `true` | `false` skips every test that creates/updates/deletes |
| `UI_HEADED` | `false` | `true` shows the browser in UI tests |

## Layout

```
config/settings.py      Environments and env-var settings
core/api_client.py      requests.Session with retries, timeouts, request/response logging (passwords masked)
core/endpoints.py       API paths
core/assertions.py      assert_response(): HTTP status, responseCode, message, schema, response time
services/               One class per API area: CatalogApi (1-6), AccountApi (7-14)
schemas/                JSON Schemas (Draft 7) for each response shape
data/user_factory.py    Unique fake users (@example.com) so runs never collide
data/search_terms.json  Data-driven search terms
tests/conftest.py       Fixtures: client, services, registered_user, cleanup; writes guard
tests/test_*.py         Tests, named test_api<N>_... after the API list number
```

## How the API behaves (read before adding tests)

- **Every response is HTTP 200** with `Content-Type: text/html`. The real status is the `responseCode` field in the JSON body. `assert_response()` checks both.
- Requests are form-encoded (`data=`), not JSON.
- A wrong password on update/delete returns `404 Account not found!`, not 401.
- There is no database access, so `getUserDetailByEmail` (API 14) is the back-end check: every write is followed by a read that compares all stored fields.

## Test data and production safety

- Every account uses a unique `apiauto.<time>.<random>@example.com` address (a reserved domain, so no real mailbox).
- The `cleanup` fixture deletes each created account after the test, even when the test fails.
- `API_ALLOW_WRITES=false` turns the suite read-only for environments where writes are not allowed.

## Coverage

| API | Endpoint | Tests |
|---|---|---|
| 1 | GET productsList | schema, unique ids, prices, brands consistent with brandsList |
| 2 | POST productsList | 405 (plus PUT, DELETE) |
| 3 | GET brandsList | schema, unique ids |
| 4 | PUT brandsList | 405 |
| 5 | POST searchProduct | 5 terms, results match, case-insensitive, subset of all products, no-match returns [] |
| 6 | POST searchProduct (no param) | 400 |
| 7 | POST verifyLogin valid | 200 User exists! |
| 8 | POST verifyLogin missing param | 400 (no email, no password, neither) |
| 9 | DELETE verifyLogin | 405 |
| 10 | POST verifyLogin invalid | unknown user, wrong password, password case |
| 11 | POST createAccount | create + stored data, both titles, duplicate email, missing fields |
| 12 | DELETE deleteAccount | delete + gone, wrong password keeps account, unknown, no params |
| 13 | PUT updateAccount | update + stored data, wrong password changes nothing, unknown account |
| 14 | GET getUserDetailByEmail | all fields, unknown email, missing param |
| – | Lifecycle | create → login → read → update → read → delete → gone |
| UI | Playwright | API-created user logs in on the website; UI product names exist in the API |

CI: [.github/workflows/api-tests.yml](../.github/workflows/api-tests.yml) runs on changes under `api-tests/`, daily at 07:00 IST, and on demand with a marker expression; the HTML and JUnit reports are uploaded as a build artifact.
