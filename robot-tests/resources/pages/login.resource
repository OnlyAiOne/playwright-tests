*** Settings ***
Documentation       /login page: sign in, sign up (first step) and the account-information form.
Resource            ../web.resource


*** Variables ***
${LOGIN_EMAIL}          css:[data-qa='login-email']
${LOGIN_PASSWORD}       css:[data-qa='login-password']
${LOGIN_BUTTON}         css:[data-qa='login-button']
${LOGIN_ERROR}          css:form[action='/login'] p
${SIGNUP_NAME}          css:[data-qa='signup-name']
${SIGNUP_EMAIL}         css:[data-qa='signup-email']
${SIGNUP_BUTTON}        css:[data-qa='signup-button']
${SIGNUP_ERROR}         css:form[action='/signup'] p
${LOGGED_IN_AS}         xpath://a[contains(., 'Logged in as')]
${LOGOUT_LINK}          css:a[href='/logout']
${DELETE_LINK}          css:a[href='/delete_account']
${ACCOUNT_CREATED}      css:[data-qa='account-created']
${ACCOUNT_DELETED}      css:[data-qa='account-deleted']
${CONTINUE_BUTTON}      css:[data-qa='continue-button']


*** Keywords ***
Log In
    [Arguments]    ${email}    ${password}
    Go To Page    /login
    Input Text    ${LOGIN_EMAIL}    ${email}
    Input Password    ${LOGIN_PASSWORD}    ${password}
    Click Button    ${LOGIN_BUTTON}

Should Be Logged In As
    [Arguments]    ${name}
    Element Text Should Contain    ${LOGGED_IN_AS}    ${name}

Log Out
    Click Element    ${LOGOUT_LINK}
    Wait Until Location Contains    /login

Start Signup
    [Arguments]    ${name}    ${email}
    Go To Page    /login
    Input Text    ${SIGNUP_NAME}    ${name}
    Input Text    ${SIGNUP_EMAIL}    ${email}
    Click Button    ${SIGNUP_BUTTON}

Fill Account Information
    [Documentation]    The /signup form, filled from a UserFactory user so the API can check the result.
    [Arguments]    ${user}
    Wait Until Element Is Visible    css:[data-qa='password']
    Click Element    id:id_gender${{ 1 if $user['title'] == 'Mr' else 2 }}
    Input Password    css:[data-qa='password']    ${user}[password]
    Select From List By Value    css:[data-qa='days']    ${user}[birth_date]
    Select From List By Value    css:[data-qa='months']    ${user}[birth_month]
    Select From List By Value    css:[data-qa='years']    ${user}[birth_year]
    Input Text    css:[data-qa='first_name']    ${user}[firstname]
    Input Text    css:[data-qa='last_name']    ${user}[lastname]
    Input Text    css:[data-qa='company']    ${user}[company]
    Input Text    css:[data-qa='address']    ${user}[address1]
    Input Text    css:[data-qa='address2']    ${user}[address2]
    Select From List By Value    css:[data-qa='country']    ${user}[country]
    Input Text    css:[data-qa='state']    ${user}[state]
    Input Text    css:[data-qa='city']    ${user}[city]
    Input Text    css:[data-qa='zipcode']    ${user}[zipcode]
    Input Text    css:[data-qa='mobile_number']    ${user}[mobile_number]
    Click Button    css:[data-qa='create-account']

Delete Account Through UI
    Click Element    ${DELETE_LINK}
    Element Text Should Contain    ${ACCOUNT_DELETED}    Account Deleted!
    Click Element    ${CONTINUE_BUTTON}
