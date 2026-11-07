"""Products, brands and search (API 1-6)."""
from core import endpoints


class CatalogApi:
    def __init__(self, client):
        self.client = client

    def get_products(self):
        return self.client.get(endpoints.PRODUCTS_LIST)

    def get_brands(self):
        return self.client.get(endpoints.BRANDS_LIST)

    def search(self, term):
        data = None if term is None else {"search_product": term}
        return self.client.post(endpoints.SEARCH_PRODUCT, data=data)
