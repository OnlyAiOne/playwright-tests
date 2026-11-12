*** Settings ***
Documentation       Keywords for the onlyai.one backend (FastAPI). Unlike most practice APIs, this one
...                 uses real HTTP status codes: 200, 401 wrong passcode, 405 wrong method, 422 invalid input.
Resource            common.resource
Library             RequestsLibrary


*** Variables ***
@{KURAL_FIELDS}         date    number    chapter    tamil    tamil_line1    tamil_line2    english


*** Keywords ***
Create API Session
    Create Session    onlyai    ${API_URL}    timeout=${TIMEOUT}    max_retries=2    disable_warnings=1

Response Should Be Fast
    [Arguments]    ${response}
    ${ms}=    Evaluate    $response.elapsed.total_seconds() * 1000
    Should Be True    ${ms} < ${MAX_MS}    Response took ${ms} ms (limit ${MAX_MS} ms)

Response Should Be JSON
    [Arguments]    ${response}
    Should Start With    ${response.headers}[content-type]    application/json

Detail Should Be
    [Documentation]    FastAPI error bodies look like {"detail": "..."}.
    [Arguments]    ${response}    ${status}    ${detail}
    Status Should Be    ${status}    ${response}
    Should Be Equal    ${response.json()}[detail]    ${detail}

Validation Error Should Be
    [Documentation]    422 from FastAPI/pydantic: {"detail": [{"type": ..., "loc": [...]}]}.
    [Arguments]    ${response}    ${type}
    Status Should Be    422    ${response}
    Should Be Equal    ${response.json()}[detail][0][type]    ${type}

Method Should Not Be Allowed
    [Arguments]    ${method}    ${path}
    ${response}=    Run Keyword    ${method} On Session    onlyai    ${path}    expected_status=any
    Detail Should Be    ${response}    405    Method Not Allowed

# --- Kural of the day ---

Get Kural Of Day
    ${response}=    GET On Session    onlyai    /kural-of-day
    RETURN    ${response}

Kural Should Be Valid
    [Documentation]    The core fields the page depends on; extra fields may be added without breaking this.
    [Arguments]    ${kural}
    FOR    ${field}    IN    @{KURAL_FIELDS}
        Dictionary Should Contain Key    ${kural}    ${field}
    END
    Should Be True    isinstance($kural['number'], int) and 1 <= $kural['number'] <= 1330
    ...    Kural number out of range: ${kural}[number]
    Should Be Equal    ${kural}[tamil]    ${kural}[tamil_line1]${SPACE}${kural}[tamil_line2]
    Should Not Be Empty    ${kural}[english]
    Should Not Be Empty    ${kural}[chapter]

# --- Enquiry, chat and owner history ---

Post JSON
    [Documentation]    Sends any JSON value (object, list or string) and returns the response, whatever its status.
    [Arguments]    ${path}    ${body}
    ${response}=    POST On Session    onlyai    ${path}    json=${body}    expected_status=any
    RETURN    ${response}

Send Enquiry
    [Arguments]    ${name}    ${contact}    ${product}    ${message}
    ${body}=    Create Dictionary    name=${name}    contact=${contact}    product=${product}    message=${message}
    ${response}=    Post JSON    /enquiry    ${body}
    RETURN    ${response}

Get Owner Data
    [Documentation]    `chat-history` or `enquiries`. Pass `${None}` to leave the passcode out.
    [Arguments]    ${path}    ${passcode}
    ${params}=    Evaluate    {} if $passcode is None else {'passcode': $passcode}
    ${response}=    GET On Session    onlyai    /${path}    params=${params}    expected_status=any
    RETURN    ${response}
