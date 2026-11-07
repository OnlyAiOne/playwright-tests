// Site addresses for the UltimateQA suite.
//
// PROD_BASE_URL is the live ultimateqa.com practice site. To run against another copy,
// set UQA_BASE_URL before running:
//   PowerShell:  $env:UQA_BASE_URL="https://staging.example.com/"; npm run pw:uqa
// The courses sign-in page lives on its own host, so it has its own address.

const PROD_BASE_URL = 'https://ultimateqa.com/';
const COURSES_URL = 'https://courses.ultimateqa.com/';

// Always ends with "/" so page paths can be appended: BASE_URL + 'automation'
const BASE_URL = (process.env.UQA_BASE_URL || PROD_BASE_URL).replace(/\/*$/, '/');

module.exports = { PROD_BASE_URL, BASE_URL, COURSES_URL };
