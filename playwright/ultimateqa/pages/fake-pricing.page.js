// Locators for the fake pricing page: https://ultimateqa.com/fake-pricing-page

const path = 'fake-pricing-page';

const plans = [
  { name: 'Free Trial', price: '$0' },
  { name: 'Basic', price: '$80' },
  { name: 'Enterprise', price: '$900' },
];

module.exports = (page) => {
  const content = page.locator('article');

  return {
    heading: (name) => content.getByRole('heading', { name, exact: true }).first(),
    // One Divi pricing table per plan, found by its title
    plan: (name) => {
      const root = content.locator('.et_pb_pricing_table').filter({
        has: page.locator('.et_pb_pricing_title', { hasText: new RegExp(`^\\s*${name}\\s*$`) }),
      });
      return {
        root,
        price: root.locator('.et_pb_sum'),
        purchaseButton: root.locator('a', { hasText: 'Purchase' }),
      };
    },
    button: (name) => content.locator('a.et_pb_button').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first(),
  };
};

module.exports.path = path;
module.exports.plans = plans;
