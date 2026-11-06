// Locators that exist on every page, for SEO, accessibility and link checks.

module.exports = (page) => ({
  root: page.locator('html'),
  metaDescription: page.locator('meta[name="description"]'),
  images: page.locator('img'),
  links: page.locator('a[href]'),
  heading: (name) => page.getByRole('heading', { name }).first(),
});
