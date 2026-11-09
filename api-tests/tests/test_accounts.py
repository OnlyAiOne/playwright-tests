"""API 11-14: create, update, read and delete a user account.

There is no direct database access, so getUserDetailByEmail (API 14) is the back-end check:
every write is followed by a read that confirms what was actually stored.
"""
import pytest

from core.assertions import assert_response
from data.user_factory import new_user, unique_email

pytestmark = pytest.mark.account

NOT_FOUND = "Account not found!"
EMAIL_NOT_FOUND = "Account not found with this email, try another email!"


def assert_stored(accounts, user):
    response = accounts.get_by_email(user.email)
    assert_response(response, 200, schema="user_detail")
    stored = {k: v for k, v in response.json["user"].items() if k != "id"}
    assert stored == user.expected_detail()


@pytest.mark.smoke
@pytest.mark.writes
@pytest.mark.contract
def test_api11_create_account(accounts, cleanup):
    user = new_user()
    response = accounts.create(user)
    cleanup.append((user.email, user.password))
    assert_response(response, 201, "User created!", schema="message")
    assert_stored(accounts, user)


@pytest.mark.regression
@pytest.mark.writes
@pytest.mark.parametrize("title", ["Mr", "Mrs"])
def test_api11_create_account_with_each_title(accounts, cleanup, title):
    user = new_user(title=title)
    response = accounts.create(user)
    cleanup.append((user.email, user.password))
    assert_response(response, 201, "User created!")
    assert_stored(accounts, user)


@pytest.mark.negative
@pytest.mark.writes
def test_api11_create_account_with_existing_email(accounts, registered_user):
    response = accounts.create(registered_user.with_changes(name="Someone Else"))
    assert_response(response, 400, "Email already exists!", schema="message")


@pytest.mark.negative
@pytest.mark.parametrize("field", ["name", "email", "password"])
def test_api11_create_account_with_missing_field(client, field):
    form = new_user().to_form()
    form.pop(field)
    response = client.post("/createAccount", data=form)
    assert_response(response, 400, f"Bad request, {field} parameter is missing in POST request.", schema="message")


@pytest.mark.smoke
@pytest.mark.writes
@pytest.mark.contract
def test_api12_delete_account(accounts, registered_user):
    response = accounts.delete(registered_user.email, registered_user.password)
    assert_response(response, 200, "Account deleted!", schema="message")
    assert_response(accounts.get_by_email(registered_user.email), 404, EMAIL_NOT_FOUND)
    assert_response(accounts.verify_login(registered_user.email, registered_user.password), 404, "User not found!")


@pytest.mark.negative
@pytest.mark.writes
def test_api12_delete_account_with_wrong_password_keeps_account(accounts, registered_user):
    response = accounts.delete(registered_user.email, registered_user.password + "x")
    assert_response(response, 404, NOT_FOUND)
    assert_stored(accounts, registered_user)


@pytest.mark.negative
def test_api12_delete_unknown_account(accounts):
    assert_response(accounts.delete(unique_email(), "Whatever1"), 404, NOT_FOUND, schema="message")


@pytest.mark.negative
def test_api12_delete_account_without_parameters(client):
    response = client.delete("/deleteAccount")
    assert_response(response, 400, "Bad request, email parameter is missing in DELETE request.", schema="message")


@pytest.mark.smoke
@pytest.mark.writes
@pytest.mark.contract
def test_api13_update_account(accounts, registered_user):
    updated = registered_user.with_changes(
        name="API Auto Updated", company="Updated Co", city="Madurai", address1="99 New Road", zipcode="625001"
    )
    response = accounts.update(updated)
    assert_response(response, 200, "User updated!", schema="message")
    assert_stored(accounts, updated)


@pytest.mark.negative
@pytest.mark.writes
def test_api13_update_with_wrong_password_changes_nothing(accounts, registered_user):
    response = accounts.update(registered_user.with_changes(password="WrongPass1", city="Nowhere"))
    assert_response(response, 404, NOT_FOUND)
    assert_stored(accounts, registered_user)


@pytest.mark.negative
def test_api13_update_unknown_account(accounts):
    assert_response(accounts.update(new_user()), 404, NOT_FOUND, schema="message")


@pytest.mark.smoke
@pytest.mark.writes
@pytest.mark.contract
def test_api14_get_user_detail_by_email(accounts, registered_user):
    assert_stored(accounts, registered_user)


@pytest.mark.negative
def test_api14_get_user_detail_for_unknown_email(accounts):
    assert_response(accounts.get_by_email(unique_email()), 404, EMAIL_NOT_FOUND, schema="message")


@pytest.mark.negative
def test_api14_get_user_detail_without_email(accounts):
    response = accounts.get_by_email(None)
    assert_response(response, 400, "Bad request, email parameter is missing in GET request.", schema="message")


@pytest.mark.regression
@pytest.mark.writes
def test_full_account_lifecycle(accounts, cleanup):
    """Create -> login -> read -> update -> read -> delete -> gone, as one business flow."""
    user = new_user()
    cleanup.append((user.email, user.password))

    assert_response(accounts.create(user), 201, "User created!")
    assert_response(accounts.verify_login(user.email, user.password), 200, "User exists!")
    assert_stored(accounts, user)

    moved = user.with_changes(state="Karnataka", city="Bengaluru", zipcode="560001")
    assert_response(accounts.update(moved), 200, "User updated!")
    assert_stored(accounts, moved)

    assert_response(accounts.delete(user.email, user.password), 200, "Account deleted!")
    assert_response(accounts.get_by_email(user.email), 404, EMAIL_NOT_FOUND)
