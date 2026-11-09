*** Settings ***
Documentation       Keywords for the automationexercise.com API (https://automationexercise.com/api_list).
...
...                 How the API behaves: every response is HTTP 200 and the real status is the
...                 `responseCode` field in the JSON body. Requests are form-encoded, not JSON.
Resource            common.resource
Library             RequestsLibrary


*** Variables ***
${NOT_SUPPORTED}        This request method is not supported.
${USER_NOT_FOUND}       User not found!
${ACCOUNT_NOT_FOUND}    Account not found!
${EMAIL_NOT_FOUND}      Account not found with this email, try another email!
@{CREATED_ACCOUNTS}


*** Keywords ***
Create API Session
    Create Session    api    ${API_URL}    timeout=${TIMEOUT}    max_retries=2    disable_warnings=1

Response Should Be
    [Documentation]    Checks HTTP 200, the body's `responseCode` and, when given, its `message`.
    [Arguments]    ${response}    ${code}    ${message}=${None}
    Status Should Be    200    ${response}
    ${body}=    Set Variable    ${response.json()}
    Should Be Equal As Integers    ${body}[responseCode]    ${code}    responseCode: ${body}
    IF    $message is not None
        Should Be Equal    ${body}[message]    ${message}
    END
    RETURN    ${body}

Response Should Be Fast
    [Arguments]    ${response}
    ${ms}=    Evaluate    $response.elapsed.total_seconds() * 1000
    Should Be True    ${ms} < ${MAX_MS}    Response took ${ms} ms (limit ${MAX_MS} ms)

Product Should Be Valid
    [Documentation]    The product shape checked by api-tests/schemas/products_list.json.
    [Arguments]    ${product}
    Dictionary Should Contain Key    ${product}    id
    Should Be True    isinstance($product['id'], int) and $product['id'] > 0
    Should Not Be Empty    ${product}[name]
    Should Not Be Empty    ${product}[brand]
    Should Match Regexp    ${product}[price]    ^Rs\\. \\d+$
    Should Contain Any    ${product}[category][usertype][usertype]    Women    Men    Kids
    Should Not Be Empty    ${product}[category][category]

Ids Should Be Unique
    [Arguments]    ${items}
    ${ids}=    Evaluate    [item['id'] for item in $items]
    List Should Not Contain Duplicates    ${ids}

# --- Catalog (API 1-6) ---

Get Products List
    ${response}=    GET On Session    api    /productsList
    RETURN    ${response}

Get Brands List
    ${response}=    GET On Session    api    /brandsList
    RETURN    ${response}

Search Product
    [Arguments]    ${term}
    ${response}=    POST On Session    api    /searchProduct    data=${{ {'search_product': $term} }}
    RETURN    ${response}

# --- Accounts (API 7-14) ---

Verify Login
    [Documentation]    Pass `${None}` to leave a parameter out.
    [Arguments]    ${email}    ${password}
    ${form}=    Evaluate    {k: v for k, v in (('email', $email), ('password', $password)) if v is not None}
    ${response}=    POST On Session    api    /verifyLogin    data=${form}
    RETURN    ${response}

Create Account
    [Arguments]    ${user}
    ${response}=    POST On Session    api    /createAccount    data=${user}
    RETURN    ${response}

Update Account
    [Arguments]    ${user}
    ${response}=    PUT On Session    api    /updateAccount    data=${user}
    RETURN    ${response}

Delete Account
    [Arguments]    ${email}    ${password}
    ${response}=    DELETE On Session    api    /deleteAccount
    ...    data=${{ {'email': $email, 'password': $password} }}
    RETURN    ${response}

Get User Detail By Email
    [Arguments]    ${email}
    ${response}=    GET On Session    api    /getUserDetailByEmail    params=email=${email}
    RETURN    ${response}

Stored User Should Match
    [Documentation]    getUserDetailByEmail is the back-end check: compares every stored field.
    [Arguments]    ${user}
    ${response}=    Get User Detail By Email    ${user}[email]
    ${body}=    Response Should Be    ${response}    200
    ${stored}=    Evaluate    {k: v for k, v in $body['user'].items() if k != 'id'}
    ${expected}=    Expected Detail    ${user}
    Dictionaries Should Be Equal    ${stored}    ${expected}

Register Test User
    [Documentation]    Creates a fresh account through the API. It is deleted in the suite teardown.
    [Arguments]    &{overrides}
    ${user}=    New User    &{overrides}
    ${response}=    Create Account    ${user}
    Response Should Be    ${response}    201    User created!
    Track Account For Cleanup    ${user}
    RETURN    ${user}

Track Account For Cleanup
    [Arguments]    ${user}
    Append To List    ${CREATED_ACCOUNTS}    ${user}

Delete Created Accounts
    [Documentation]    Suite teardown: removes every account the suite made, even after failures.
    FOR    ${user}    IN    @{CREATED_ACCOUNTS}
        Run Keyword And Ignore Error    Delete Account    ${user}[email]    ${user}[password]
    END
    Evaluate    $CREATED_ACCOUNTS.clear()
