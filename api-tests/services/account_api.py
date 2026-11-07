"""Login verification and the user account lifecycle (API 7-14)."""
from core import endpoints


class AccountApi:
    def __init__(self, client):
        self.client = client

    def verify_login(self, email=None, password=None):
        data = {k: v for k, v in (("email", email), ("password", password)) if v is not None}
        return self.client.post(endpoints.VERIFY_LOGIN, data=data or None)

    def create(self, user):
        return self.client.post(endpoints.CREATE_ACCOUNT, data=user.to_form())

    def update(self, user):
        return self.client.put(endpoints.UPDATE_ACCOUNT, data=user.to_form())

    def delete(self, email, password):
        return self.client.delete(endpoints.DELETE_ACCOUNT, data={"email": email, "password": password})

    def get_by_email(self, email):
        params = None if email is None else {"email": email}
        return self.client.get(endpoints.USER_DETAIL_BY_EMAIL, params=params)
