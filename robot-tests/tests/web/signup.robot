*** Settings ***
Documentation       Registering through the website, checked through the API.
Resource            ../../resources/pages/login.resource
Resource            ../../resources/api.resource
Suite Teardown      Delete Created Accounts
Test Tags           account


*** Test Cases ***
Register Through The UI And Check Stored Details With The API
    [Documentation]    Sign up in the browser -> API shows every field -> delete in the browser -> API shows it gone.
    [Tags]    smoke    writes    hybrid    e2e
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    ${user}=    New User    title=Mrs
    Track Account For Cleanup    ${user}
    Start Signup    ${user}[name]    ${user}[email]
    Fill Account Information    ${user}
    Element Text Should Contain    ${ACCOUNT_CREATED}    Account Created!
    Click Element    ${CONTINUE_BUTTON}
    Should Be Logged In As    ${user}[name]
    Stored User Should Match    ${user}
    Delete Account Through UI
    ${response}=    Get User Detail By Email    ${user}[email]
    Response Should Be    ${response}    404    ${EMAIL_NOT_FOUND}
