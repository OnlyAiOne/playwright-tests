"""API + Playwright UI: data created through the API must work in the website, and vice versa.

Run with: pytest -m ui   (needs `pip install playwright` and `playwright install chromium`)
"""
import pytest

from config.settings import settings

pytestmark = [pytest.mark.ui, pytest.mark.writes]

sync_api = pytest.importorskip("playwright.sync_api", reason="playwright is not installed")


@pytest.fixture(scope="module")
def page():
    with sync_api.sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(headless=not settings.ui_headed)
        except sync_api.Error as error:
            pytest.skip(f"Cannot start Chromium, run `playwright install chromium`: {error.message.splitlines()[0]}")
        context = browser.new_context()
        # The site loads many ad scripts; blocking them keeps the UI steps fast and stable.
        context.route("**/*", lambda route: route.abort() if _is_ad(route.request.url) else route.continue_())
        yield context.new_page()
        browser.close()


def _is_ad(url):
    return any(host in url for host in ("googlesyndication", "doubleclick", "googleads", "adservice", "fundingchoices"))


def test_user_created_by_api_can_log_in_through_ui(page, registered_user):
    page.goto(f"{settings.base_url}/login")
    login_form = page.locator("form[action='/login']")
    login_form.locator("input[name='email']").fill(registered_user.email)
    login_form.locator("input[name='password']").fill(registered_user.password)
    login_form.locator("button[type='submit']").click()
    sync_api.expect(page.locator("a:has-text('Logged in as')")).to_contain_text(registered_user.name)
    page.locator("a[href='/logout']").click()


def test_products_shown_in_ui_match_api(page, catalog):
    api_names = {p["name"] for p in catalog.get_products().json["products"]}
    page.goto(f"{settings.base_url}/products")
    ui_names = set(page.locator(".features_items .productinfo p").all_inner_texts())
    assert ui_names, "No products rendered on /products"
    assert ui_names <= api_names, f"Shown in UI but missing from the API: {ui_names - api_names}"
