*** Settings ***
Documentation       API 11-14: create, update, read and delete a user account.
...
...                 There is no database access, so getUserDetailByEmail (API 14) is the back-end
...                 check: every write is followed by a read that compares what was stored.
Resource            ../../resources/api.resource
Suite Teardown      Delete Created Accounts
Test Tags           account


*** Test Cases ***
API 11: Create Account
    [Tags]    smoke    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    New User
    ${response}=    Create Account    ${user}
    Track Account For Cleanup    ${user}
    Response Should Be    ${response}    201    User created!
    Stored User Should Match    ${user}

API 11: Create Account With Each Title
    [Tags]    regression    writes
    [Setup]    Skip Unless Writes Allowed
    FOR    ${title}    IN    Mr    Mrs
        ${user}=    Register Test User    title=${title}
        Stored User Should Match    ${user}
    END

API 11: Create Account With An Existing Email
    [Tags]    negative    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${duplicate}=    Copy Dictionary    ${user}
    Set To Dictionary    ${duplicate}    name=Someone Else
    ${response}=    Create Account    ${duplicate}
    Response Should Be    ${response}    400    Email already exists!

API 11: Create Account With A Missing Field
    [Tags]    negative
    [Template]    Create Account Without Field Should Fail
    name
    email
    password

API 12: Delete Account
    [Tags]    smoke    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Delete Account    ${user}[email]    ${user}[password]
    Response Should Be    ${response}    200    Account deleted!
    ${response}=    Get User Detail By Email    ${user}[email]
    Response Should Be    ${response}    404    ${EMAIL_NOT_FOUND}

API 12: Delete Account With A Wrong Password Keeps It
    [Tags]    negative    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Delete Account    ${user}[email]    wrong-${user}[password]
    Response Should Be    ${response}    404    ${ACCOUNT_NOT_FOUND}
    Stored User Should Match    ${user}

API 12: Delete An Unknown Account
    [Tags]    negative
    ${email}=    Unique Email
    ${response}=    Delete Account    ${email}    Secret123
    Response Should Be    ${response}    404    ${ACCOUNT_NOT_FOUND}

API 13: Update Account
    [Tags]    smoke    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    Set To Dictionary    ${user}    name=Robot Updated    city=Coimbatore    company=Updated Co    title=Mrs
    ${response}=    Update Account    ${user}
    Response Should Be    ${response}    200    User updated!
    Stored User Should Match    ${user}

API 13: Update Account With A Wrong Password Changes Nothing
    [Tags]    negative    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${change}=    Copy Dictionary    ${user}
    Set To Dictionary    ${change}    password=wrong-${user}[password]    city=Madurai
    ${response}=    Update Account    ${change}
    Response Should Be    ${response}    404    ${ACCOUNT_NOT_FOUND}
    Stored User Should Match    ${user}

API 13: Update An Unknown Account
    [Tags]    negative
    ${user}=    New User
    ${response}=    Update Account    ${user}
    Response Should Be    ${response}    404    ${ACCOUNT_NOT_FOUND}

API 14: Get User Detail By Email
    [Tags]    smoke    writes
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    Stored User Should Match    ${user}

API 14: Get User Detail For An Unknown Email
    [Tags]    negative
    ${email}=    Unique Email
    ${response}=    Get User Detail By Email    ${email}
    Response Should Be    ${response}    404    ${EMAIL_NOT_FOUND}

API 14: Get User Detail Without Email
    [Tags]    negative
    ${response}=    GET On Session    api    /getUserDetailByEmail
    Response Should Be    ${response}    400    Bad request, email parameter is missing in GET request.

Account Lifecycle
    [Documentation]    Create -> login -> read -> update -> read -> delete -> gone, as one business flow.
    [Tags]    regression    writes    e2e
    [Setup]    Skip Unless Writes Allowed
    ${user}=    Register Test User
    ${response}=    Verify Login    ${user}[email]    ${user}[password]
    Response Should Be    ${response}    200    User exists!
    Stored User Should Match    ${user}
    Set To Dictionary    ${user}    address1=99 Changed Road    zipcode=641001
    ${response}=    Update Account    ${user}
    Response Should Be    ${response}    200    User updated!
    Stored User Should Match    ${user}
    ${response}=    Delete Account    ${user}[email]    ${user}[password]
    Response Should Be    ${response}    200    Account deleted!
    ${response}=    Verify Login    ${user}[email]    ${user}[password]
    Response Should Be    ${response}    404    ${USER_NOT_FOUND}


*** Keywords ***
Create Account Without Field Should Fail
    [Arguments]    ${field}
    ${user}=    New User
    Remove From Dictionary    ${user}    ${field}
    ${response}=    Create Account    ${user}
    Response Should Be    ${response}    400    Bad request, ${field} parameter is missing in POST request.
