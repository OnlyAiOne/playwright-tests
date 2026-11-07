"""API 7-10: verify login."""
import pytest

from core.assertions import assert_response
from data.user_factory import unique_email

pytestmark = pytest.mark.auth

MISSING_PARAMS = "Bad request, email or password parameter is missing in POST request."


@pytest.mark.smoke
@pytest.mark.writes
@pytest.mark.contract
def test_api7_verify_login_with_valid_details(accounts, registered_user):
    response = accounts.verify_login(registered_user.email, registered_user.password)
    assert_response(response, 200, "User exists!", schema="message")


@pytest.mark.negative
@pytest.mark.contract
@pytest.mark.parametrize(
    "email, password",
    [(None, "secret"), ("someone@example.com", None), (None, None)],
    ids=["no-email", "no-password", "no-params"],
)
def test_api8_verify_login_with_missing_parameter(accounts, email, password):
    assert_response(accounts.verify_login(email, password), 400, MISSING_PARAMS, schema="message")


@pytest.mark.negative
@pytest.mark.contract
def test_api9_delete_to_verify_login_not_supported(client):
    response = client.delete("/verifyLogin")
    assert_response(response, 405, "This request method is not supported.", schema="message")


@pytest.mark.negative
@pytest.mark.contract
def test_api10_verify_login_with_unknown_user(accounts):
    response = accounts.verify_login(unique_email(), "NoSuchPassword1")
    assert_response(response, 404, "User not found!", schema="message")


@pytest.mark.negative
@pytest.mark.writes
def test_api10_verify_login_with_wrong_password(accounts, registered_user):
    response = accounts.verify_login(registered_user.email, registered_user.password + "x")
    assert_response(response, 404, "User not found!")


@pytest.mark.negative
@pytest.mark.writes
def test_api10_verify_login_password_is_case_sensitive(accounts, registered_user):
    response = accounts.verify_login(registered_user.email, registered_user.password.swapcase())
    assert_response(response, 404, "User not found!")
