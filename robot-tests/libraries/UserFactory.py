"""Builds unique, clearly fake users so parallel and repeated runs never collide.

Same data rules as api-tests/data/user_factory.py: @example.com addresses, random passwords.
"""
import secrets
import time

from robot.api.deco import keyword, library

EMAIL_DOMAIN = "example.com"  # reserved domain (RFC 2606): never a real mailbox
EMAIL_PREFIX = "robotauto"

# createAccount form name -> getUserDetailByEmail field name
DETAIL_FIELDS = {
    "name": "name", "email": "email", "title": "title",
    "birth_date": "birth_day", "birth_month": "birth_month", "birth_year": "birth_year",
    "firstname": "first_name", "lastname": "last_name", "company": "company",
    "address1": "address1", "address2": "address2", "country": "country",
    "state": "state", "city": "city", "zipcode": "zipcode",
}


@library(scope="GLOBAL")
class UserFactory:

    @keyword
    def unique_email(self):
        return f"{EMAIL_PREFIX}.{int(time.time())}.{secrets.token_hex(3)}@{EMAIL_DOMAIN}"

    @keyword
    def new_user(self, **overrides):
        """Returns a createAccount form as a dictionary. Any field can be overridden: `name=Jo`."""
        user = {
            "name": "Robot Auto User",
            "email": self.unique_email(),
            "password": f"Pw-{secrets.token_hex(6)}",
            "title": "Mr",
            "birth_date": "15",
            "birth_month": "6",
            "birth_year": "1990",
            "firstname": "Robot",
            "lastname": "Tester",
            "company": "QA Automation Ltd",
            "address1": "12 Test Street",
            "address2": "Suite 4",
            "country": "India",
            "zipcode": "600001",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "mobile_number": "9876543210",
        }
        user.update(overrides)
        return user

    @keyword
    def expected_detail(self, user):
        """The fields getUserDetailByEmail should return for a user created with this form."""
        return {detail: user[form] for form, detail in DETAIL_FIELDS.items()}
