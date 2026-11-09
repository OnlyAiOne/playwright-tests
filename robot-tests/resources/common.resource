*** Settings ***
Documentation       Settings shared by the web and API suites. Override any of them on the
...                 command line, e.g. `robot --variable BASE_URL:https://staging.example.com tests`.
Library             Collections
Library             String
Library             ../libraries/UserFactory.py


*** Variables ***
${BASE_URL}             https://automationexercise.com
${API_URL}              ${BASE_URL}/api
${TIMEOUT}              30
${MAX_MS}               5000
# Set to False to skip every test tagged `writes` (creates, updates or deletes accounts)
${ALLOW_WRITES}         ${True}


*** Keywords ***
Skip Unless Writes Allowed
    [Documentation]    Called in the setup of every test tagged `writes`.
    Skip If    not ${ALLOW_WRITES}    Writes are disabled (ALLOW_WRITES=False)
