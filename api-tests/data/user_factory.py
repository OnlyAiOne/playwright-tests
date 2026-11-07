"""Builds unique, clearly fake users so parallel and repeated runs never collide."""
import secrets
import time
from dataclasses import asdict, dataclass, replace

EMAIL_DOMAIN = "example.com"  # reserved domain (RFC 2606): never a real mailbox
EMAIL_PREFIX = "apiauto"


def unique_email():
    return f"{EMAIL_PREFIX}.{int(time.time())}.{secrets.token_hex(3)}@{EMAIL_DOMAIN}"


@dataclass(frozen=True)
class User:
    name: str
    email: str
    password: str
    title: str = "Mr"
    birth_date: str = "15"
    birth_month: str = "6"
    birth_year: str = "1990"
    firstname: str = "Api"
    lastname: str = "Tester"
    company: str = "QA Automation Ltd"
    address1: str = "12 Test Street"
    address2: str = "Suite 4"
    country: str = "India"
    zipcode: str = "600001"
    state: str = "Tamil Nadu"
    city: str = "Chennai"
    mobile_number: str = "9876543210"

    def to_form(self):
        return asdict(self)

    def with_changes(self, **changes):
        return replace(self, **changes)

    def expected_detail(self):
        """The fields getUserDetailByEmail returns, mapped from the createAccount form names."""
        return {
            "name": self.name,
            "email": self.email,
            "title": self.title,
            "birth_day": self.birth_date,
            "birth_month": self.birth_month,
            "birth_year": self.birth_year,
            "first_name": self.firstname,
            "last_name": self.lastname,
            "company": self.company,
            "address1": self.address1,
            "address2": self.address2,
            "country": self.country,
            "state": self.state,
            "city": self.city,
            "zipcode": self.zipcode,
        }


def new_user(**overrides):
    fields = {"name": "API Auto User", "email": unique_email(), "password": f"Pw-{secrets.token_hex(6)}"}
    fields.update(overrides)
    return User(**fields)
