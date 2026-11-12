# Robot Framework: onlyai.one Web + API Tests

Functional tests for [onlyai.one](https://onlyai.one) (OnlyAi Art & Crafts) with **Robot Framework**:

- **API**: RequestsLibrary against the FastAPI backend (`/api/kural-of-day`, `/api/enquiry`, `/api/chat`, owner endpoints)
- **Web**: SeleniumLibrary (Chrome): home page, menu, 4 languages, Kural of the day, gallery, prices, contact links, enquiry form, chat panel, owner history page, phone layout
- **Hybrid**: the page is compared with the API (Kural of the day)

This suite is self-contained and separate from `robot-tests/` (automationexercise.com).

## Setup

```bash
cd onlyai-tests
python -m venv .venv
.venv\Scripts\activate          # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
```

The `robot-tests` venv has the same libraries and can be reused: `..\robot-tests\.venv\Scripts\activate`.

## Run

Run from `onlyai-tests`, always pointing at a folder (`tests`, `tests/api`, `tests/web`) so its `__init__.robot` runs.

| Command | What runs |
|---|---|
| `robot -d reports tests` | Everything (42 tests) |
| `robot -d reports tests/api` | API only, no browser |
| `robot -d reports tests/web` | Web only |
| `robot -d reports -i smoke tests` | Quick health check |
| `robot -d reports -i negative tests` | Wrong methods, invalid bodies, wrong passcode, empty form |
| `robot -d reports --suite Language tests/web` | One file |
| `robot -d reports -v HEADLESS:False tests/web` | Show the browser |
| `robot -d reports -e known-defect tests` | Leave out the known-defect checks |
| `pabot --processes 4 -d reports tests` | Parallel (activate the venv first) |

Reports: `reports/report.html`, `reports/log.html` (screenshots on web failures), `reports/output.xml`.

## Production safety

The site is live, so by default the suite **never** creates data or costs money:

- `ALLOW_WRITES` is `False`. Tests tagged `writes` (send a real enquiry, send a chat message to the Claude assistant) are skipped. Turn them on only against a test environment or with the owner's approval: `-v ALLOW_WRITES:True`.
- Negative enquiry/chat API tests send bodies that fail validation (HTTP 422), so nothing is saved and no chat reply is generated.
- Owner endpoints and the history page are only ever tried with a wrong or missing passcode.
- Phone, email and WhatsApp links are checked by their address; nothing is dialled or sent.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://onlyai.one` | Site under test (API is `${BASE_URL}/api`) |
| `ALLOW_WRITES` | `False` | `True` runs the `writes` tests |
| `TIMEOUT` | `30` | API request timeout, seconds |
| `MAX_MS` | `5000` | Response-time limit for the Kural smoke test |
| `BROWSER` | `chrome` | `chrome`, `edge` or `firefox` |
| `HEADLESS` | `True` | `False` shows the browser |

## Layout

```
requirements.txt
libraries/Drivers.py            Finds the browser driver with Selenium Manager
resources/
  common.resource               BASE_URL, ALLOW_WRITES, writes guard
  api.resource                  API session, response checks, endpoint keywords
  web.resource                  Browser start, session reset, scroll/visibility helpers
  pages/home.resource           Menu, language, Kural, gallery, price table, contact links
  pages/enquiry.resource        Enquiry form
  pages/chat.resource           Ask OnlyAi chat panel
  pages/history.resource        Owner history page (/#/history)
tests/
  api/                          kural, enquiry, chat, owner
  web/                          home, language, kural, pricing, contact, enquiry, chat, history, mobile
```

All locators use the site's own `data-testid` attributes.

## Tags

`api`, `web`, `smoke`, `regression`, `negative`, `contract`, `hybrid`, `security`, `writes`, `known-defect`, plus one area tag per file: `kural`, `enquiry`, `chat`, `owner`, `home`, `language`, `pricing`, `contact`, `mobile`.

## Known defects

Tests tagged `known-defect` carry Robot's `robot:skip-on-failure` tag: while the defect exists they are reported as SKIP with the original failure, and they pass on their own once it is fixed.

| Test | Defect |
|---|---|
| HTML Lang Attribute Follows The Selected Language | `<html lang>` stays `en` in Tamil, Hindi and Korean |
| Menu Is Reachable On A Phone | Below the desktop breakpoint the menu links are hidden and no menu button replaces them |

## How the site behaves (read before adding tests)

- Single-page React app; the owner page uses hash routing: `/#/history` (plain `/history` shows the home page).
- Sections fade in when scrolled to. Use `Bring Into View` before checking what the user sees, and `Text Content Should Contain` to check text that may still be fading in.
- The header hides while the page is scrolled down. `Scroll To Top` runs before any header click.
- The Kural of the day changes daily; compare the page with `/api/kural-of-day`, never with fixed text.
- The API uses real status codes: 401 wrong passcode, 405 wrong method, 422 invalid input (`{"detail": ...}`).
- React inputs ignore `Clear Element Text`; clear them with `Press Keys    <locator>    CTRL+a    BACKSPACE`.

## Last verified

12 Nov 2026 against the live site: 42 tests, 36 passed, 6 skipped (4 `writes`, 2 `known-defect`), sequentially and with pabot.
