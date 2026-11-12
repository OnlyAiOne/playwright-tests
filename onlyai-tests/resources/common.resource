*** Settings ***
Documentation       Settings shared by the onlyai.one web and API suites. Override any of them on the
...                 command line, e.g. `robot -v BASE_URL:https://staging.onlyai.one tests`.
Library             Collections
Library             String
Library             DateTime


*** Variables ***
${BASE_URL}             https://onlyai.one
${API_URL}              ${BASE_URL}/api
${TIMEOUT}              30
${MAX_MS}               5000
# Off by default: an enquiry reaches the real business and a chat message costs Claude usage.
# Set to True only against a test environment or with the site owner's approval.
${ALLOW_WRITES}         ${False}
${PHONE}                919962987678
${EMAIL}                info@onlyai.one


*** Keywords ***
Skip Unless Writes Allowed
    [Documentation]    Called in the setup of every test tagged `writes`.
    Skip If    not ${ALLOW_WRITES}    Writes are disabled (ALLOW_WRITES=False)
