# Robot Framework: Web + API Automation (automationexercise.com)

Keyword-driven suite for [automationexercise.com](https://automationexercise.com) built with **Robot Framework**:

- **API**: RequestsLibrary, all 14 APIs on the [API list](https://automationexercise.com/api_list)
- **Web**: SeleniumLibrary (Chrome), sign in/out, signup, products, search and cart
- **Hybrid**: the API creates test data for the web tests and checks what the website stored

## Setup

```bash
cd robot-tests
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
```

The web tests need Chrome installed. Selenium Manager downloads the matching ChromeDriver on first run (any older `chromedriver` on PATH is ignored).

## Run

| Command | What runs |
|---|---|
| `robot -d reports tests` | Everything |
| `robot -d reports tests/api` | API only, no browser |
| `robot -d reports tests/web` | Web (and hybrid) only |
| `robot -d reports --suite Cart tests/web` | One file (run through its folder so the browser setup in `__init__.robot` runs) |
| `robot -d reports -i smoke tests` | Quick health check |
| `robot -d reports -e writes tests` | Read-only: creates no accounts |
| `robot -d reports -i negative tests` | Missing parameters, wrong methods, unknown users |
| `robot -d reports -i hybrid tests` | Tests that use both the API and the browser |
| `robot -d reports -v HEADLESS:False tests/web` | Show the browser |
| `robot -d reports -v BROWSER:edge tests/web` | Run in Edge (`firefox` also works) |
| `pabot --processes 4 -d reports tests` | Parallel, one process per suite file (activate the venv first: pabot starts `robot` from PATH) |
| `robot -d reports --rerunfailed reports/output.xml tests` | Re-run only the failures |

Each run writes `report.html`, `log.html` (every keyword step, screenshots on failure) and `output.xml` to the output directory. Add `-x junit.xml` for CI or Jenkins.

## Configuration

Override any variable with `-v NAME:value`:

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://automationexercise.com` | Site under test (API is `${BASE_URL}/api`) |
| `TIMEOUT` | `30` | API request timeout, seconds |
| `MAX_MS` | `5000` | Response-time limit checked by smoke tests |
| `ALLOW_WRITES` | `True` | `False` skips every test tagged `writes` |
| `BROWSER` | `chrome` | `chrome`, `edge` or `firefox` |
| `HEADLESS` | `True` | `False` shows the browser |

## Layout

```
requirements.txt
libraries/UserFactory.py        Unique fake users (@example.com) and the expected stored fields
libraries/Drivers.py            Finds the right browser driver with Selenium Manager
resources/
  common.resource               Shared variables, writes guard
  api.resource                  API keywords: session, Response Should Be, catalog and account calls, cleanup
  web.resource                  Browser setup (ad hosts blocked), shared web keywords
  pages/login.resource          /login and /signup locators and keywords
  pages/products.resource       /products, product details and /view_cart
tests/
  api/                          products.robot (API 1-6), login.robot (7-10), accounts.robot (11-14)
  web/                          login.robot, signup.robot, products.robot, cart.robot
```

Test names start with the API number (`API 11: ...`) so results map straight to the API list.

## Tags

`api`, `web`, `smoke`, `regression`, `negative`, `contract`, `writes`, `hybrid`, `e2e`, plus one area tag per file: `products`, `auth`, `account`, `cart`.

## How the API behaves

- **Every response is HTTP 200.** The real status is the `responseCode` field in the JSON body; `Response Should Be` checks both.
- Requests are form-encoded, not JSON.
- A wrong password on update/delete returns `404 Account not found!`.
- `getUserDetailByEmail` (API 14) is the back-end check: every write, from the API or the website, is followed by a read that compares all stored fields.

## Test data and production safety

- Every account uses a unique `robotauto.<time>.<random>@example.com` address (a reserved domain, so no real mailbox).
- Each suite's teardown deletes every account it created, even when tests fail.
- `-v ALLOW_WRITES:False` turns the suite read-only.
- The web tests never check out, never submit the contact form and never subscribe to the newsletter.

CI: [.github/workflows/robot-tests.yml](../.github/workflows/robot-tests.yml) runs on changes under `robot-tests/`, daily, and on demand with a tag expression; reports are uploaded as a build artifact.
