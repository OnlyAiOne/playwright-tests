"""API 5-6: search product."""
import json
from pathlib import Path

import pytest

from config.settings import settings
from core.assertions import assert_response

pytestmark = pytest.mark.search

TERMS = json.loads((Path(__file__).resolve().parent.parent / "data" / "search_terms.json").read_text())


def _searchable_text(product):
    category = product["category"]
    return " ".join([product["name"], category["category"], category["usertype"]["usertype"]]).lower()


@pytest.mark.smoke
@pytest.mark.contract
@pytest.mark.parametrize("term", TERMS["match"])
def test_api5_search_product_returns_matches(catalog, term):
    response = catalog.search(term)
    assert_response(response, 200, schema="products_list", max_ms=settings.max_ms)
    products = response.json["products"]
    assert products, f"No products found for '{term}'"
    misses = [p["name"] for p in products if term.lower() not in _searchable_text(p)]
    assert not misses, f"Results that do not match '{term}': {misses}"


@pytest.mark.regression
def test_api5_search_is_case_insensitive(catalog):
    lower = {p["id"] for p in catalog.search("jean").json["products"]}
    upper = {p["id"] for p in catalog.search("JEAN").json["products"]}
    assert lower == upper


@pytest.mark.regression
def test_api5_search_results_are_subset_of_products_list(catalog):
    all_ids = {p["id"] for p in catalog.get_products().json["products"]}
    found_ids = {p["id"] for p in catalog.search("dress").json["products"]}
    assert found_ids <= all_ids, f"Search returned unknown ids: {found_ids - all_ids}"


@pytest.mark.negative
@pytest.mark.parametrize("term", TERMS["no_match"])
def test_api5_search_unknown_term_returns_empty_list(catalog, term):
    response = catalog.search(term)
    assert_response(response, 200, schema="products_list")
    assert response.json["products"] == []


@pytest.mark.negative
@pytest.mark.contract
def test_api6_search_without_parameter(catalog):
    response = catalog.search(None)
    assert_response(
        response, 400, "Bad request, search_product parameter is missing in POST request.", schema="message"
    )
