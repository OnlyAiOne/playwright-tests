import logging

import pytest

from config.settings import settings
from core.api_client import ApiClient
from data.user_factory import new_user
from services import AccountApi, CatalogApi

log = logging.getLogger("fixtures")


def pytest_report_header(config):
    return f"API env: {settings.env} ({settings.api_url}), writes allowed: {settings.allow_writes}"


def pytest_collection_modifyitems(config, items):
    if settings.allow_writes:
        return
    skip = pytest.mark.skip(reason="API_ALLOW_WRITES=false: test changes data")
    for item in items:
        if "writes" in item.keywords:
            item.add_marker(skip)


@pytest.fixture(scope="session")
def client():
    api_client = ApiClient(settings.api_url, timeout=settings.timeout, retries=settings.retries)
    yield api_client
    api_client.close()


@pytest.fixture(scope="session")
def catalog(client):
    return CatalogApi(client)


@pytest.fixture(scope="session")
def accounts(client):
    return AccountApi(client)


@pytest.fixture
def cleanup(accounts):
    """Register (email, password) pairs; each is deleted after the test even if it failed."""
    created = []
    yield created
    for email, password in created:
        response = accounts.delete(email, password)
        if response.response_code not in (200, 404):  # 404: the test already deleted it
            log.warning("Cleanup of %s failed: %s", email, response.json)


@pytest.fixture
def registered_user(accounts, cleanup):
    """A freshly created account, deleted again after the test."""
    user = new_user()
    response = accounts.create(user)
    assert response.response_code == 201, f"Setup could not create a user: {response.json}"
    cleanup.append((user.email, user.password))
    return user
