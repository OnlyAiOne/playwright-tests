*** Settings ***
Documentation       API 7-10: verify login.
Resource            ../../resources/api.resource
Suite Teardown      Delete Created Accounts
Test Tags           auth


*** Variables ***
${MISSING_PARAMS}       Bad request, email or password parameter is missing in POST request.


*** Test Cases ***
API 7: Verify Login With Valid Details
    [Tags]    smoke    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Verify Login    ${user}[email]    ${user}[password]
    Response Should Be    ${response}    200    User exists!

API 8: Verify Login With A Missing Parameter
    [Tags]    negative
    [Template]    Login Should Be Rejected As Bad Request
    ${None}               Secret123
    nobody@example.com    ${None}
    ${None}               ${None}

API 9: DELETE To Verify Login Is Not Supported
    [Tags]    negative
    ${response}=    DELETE On Session    api    /verifyLogin
    Response Should Be    ${response}    405    ${NOT_SUPPORTED}

API 10: Verify Login With An Unknown User
    [Tags]    negative
    ${email}=    Unique Email
    ${response}=    Verify Login    ${email}    Secret123
    Response Should Be    ${response}    404    ${USER_NOT_FOUND}

API 10: Verify Login With A Wrong Password
    [Tags]    negative    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Verify Login    ${user}[email]    wrong-${user}[password]
    Response Should Be    ${response}    404    ${USER_NOT_FOUND}

API 10: Verify Login Password Is Case Sensitive
    [Tags]    negative    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Verify Login    ${user}[email]    ${{ $user['password'].swapcase() }}
    Response Should Be    ${response}    404    ${USER_NOT_FOUND}


*** Keywords ***
Login Should Be Rejected As Bad Request
    [Arguments]    ${email}    ${password}
    ${response}=    Verify Login    ${email}    ${password}
    Response Should Be    ${response}    400    ${MISSING_PARAMS}
