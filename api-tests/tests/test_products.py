"""API 1-4: products list and brands list."""
from collections import Counter

import pytest

from config.settings import settings
from core.assertions import assert_response

pytestmark = pytest.mark.products


@pytest.fixture(scope="module")
def products_response(catalog):
    return catalog.get_products()


@pytest.fixture(scope="module")
def brands_response(catalog):
    return catalog.get_brands()


@pytest.mark.smoke
@pytest.mark.contract
def test_api1_get_all_products_list(products_response):
    assert_response(products_response, 200, schema="products_list", max_ms=settings.max_ms)
    assert len(products_response.json["products"]) > 0


@pytest.mark.regression
def test_api1_product_ids_are_unique(products_response):
    ids = Counter(p["id"] for p in products_response.json["products"])
    duplicates = [i for i, n in ids.items() if n > 1]
    assert not duplicates, f"Duplicate product ids: {duplicates}"


@pytest.mark.regression
def test_api1_prices_are_positive(products_response):
    bad = [p for p in products_response.json["products"] if int(p["price"].split()[-1]) <= 0]
    assert not bad, f"Products with non-positive price: {bad}"


@pytest.mark.regression
def test_api1_product_brands_exist_in_brands_list(products_response, brands_response):
    brands = {b["brand"] for b in brands_response.json["brands"]}
    unknown = {p["brand"] for p in products_response.json["products"]} - brands
    assert not unknown, f"Product brands missing from brandsList: {unknown}"


@pytest.mark.negative
@pytest.mark.contract
def test_api2_post_to_products_list_not_supported(client):
    response = client.post("/productsList")
    assert_response(response, 405, "This request method is not supported.", schema="message")


@pytest.mark.smoke
@pytest.mark.contract
def test_api3_get_all_brands_list(brands_response):
    assert_response(brands_response, 200, schema="brands_list", max_ms=settings.max_ms)


@pytest.mark.regression
def test_api3_brand_ids_are_unique(brands_response):
    ids = Counter(b["id"] for b in brands_response.json["brands"])
    assert all(n == 1 for n in ids.values()), f"Duplicate brand ids: {ids}"


@pytest.mark.negative
@pytest.mark.contract
def test_api4_put_to_brands_list_not_supported(client):
    response = client.put("/brandsList")
    assert_response(response, 405, "This request method is not supported.", schema="message")


@pytest.mark.negative
@pytest.mark.parametrize("method", ["PUT", "DELETE"])
def test_products_list_rejects_other_write_methods(client, method):
    assert_response(client.request(method, "/productsList"), 405, "This request method is not supported.")
