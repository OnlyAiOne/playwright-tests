*** Settings ***
Documentation       Sign in, sign out and the signup checks on /login.
Resource            ../../resources/pages/login.resource
Resource            ../../resources/api.resource
Suite Teardown      Delete Created Accounts
Test Tags           auth


*** Test Cases ***
User Created Through The API Can Log In
    [Tags]    smoke    writes    hybrid
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    ${user}=    Register Test User
    Log In    ${user}[email]    ${user}[password]
    Should Be Logged In As    ${user}[name]

Log In With A Wrong Password Shows An Error
    [Tags]    negative
    ${email}=    Unique Email
    Log In    ${email}    wrong-password
    Element Text Should Contain    ${LOGIN_ERROR}    Your email or password is incorrect!
    Page Should Not Contain Element    ${LOGGED_IN_AS}

Log Out Returns To The Login Page
    [Tags]    regression    writes
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    ${user}=    Register Test User
    Log In    ${user}[email]    ${user}[password]
    Should Be Logged In As    ${user}[name]
    Log Out
    Page Should Not Contain Element    ${LOGGED_IN_AS}
    Element Should Be Visible    ${LOGIN_EMAIL}

Signup With An Existing Email Shows An Error
    [Tags]    negative    writes
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    ${user}=    Register Test User
    Start Signup    Someone Else    ${user}[email]
    Element Text Should Contain    ${SIGNUP_ERROR}    Email Address already exist!
