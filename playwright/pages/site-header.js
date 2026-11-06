// Locators for the header shown on every page: the main menu, its dropdowns,
// the phone-screen menu button and the contact details in the top bar.

// Matches a dropdown item whose whole text is `name` (ignoring spaces around it)
function exactText(name) {
  return new RegExp(`^\\s*${name}\\s*$`);
}

module.exports = (page) => ({
  // A main menu link; `exact` avoids matching links that only contain the word
  menuLink: (name, { exact = false } = {}) => page.getByRole('link', { name, exact }).first(),

  // The Services mega menu opens on hover; "View All Services" sits inside it
  servicesMenu: page.locator('a.nav-link', { hasText: 'Services' }).first(),
  viewAllServicesLink: page.locator('a', { hasText: 'View All Services' }).first(),

  // The Resources and Industries menus are dropdowns
  resourcesMenu: page.locator('a.dropdown-toggle', { hasText: 'Resources' }).first(),
  dropdownItem: (name) => page.locator('a.dropdown-item').filter({ hasText: exactText(name) }).first(),

  // Shown instead of the menu on a phone screen
  mobileMenuButton: page.locator('.navbar-toggler').first(),

  // The top bar copy is hidden on some screen sizes, so these pick the visible one
  contactEmail: page.locator('a[href="mailto:admin@onlypeopleplus.com"]').filter({ visible: true }).first(),
  contactPhone: page.locator('a[href="tel:+919176376488"]').filter({ visible: true }).first(),
});
