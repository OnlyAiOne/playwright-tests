// Site addresses shared by the Playwright config and every test.
//
// PROD_BASE_URL is the live onlypps.com site. To run the same tests against another
// environment (for example a staging copy), set BASE_URL before running:
//   PowerShell:  $env:BASE_URL="https://staging.example.com/"; npm run pw:test
// Without BASE_URL, tests run against production.

const PROD_BASE_URL = 'https://onlypps.com/';

// Always ends with "/" so page paths can be appended: BASE_URL + 'contact.php'
const BASE_URL = (process.env.BASE_URL || PROD_BASE_URL).replace(/\/*$/, '/');

module.exports = { PROD_BASE_URL, BASE_URL };
