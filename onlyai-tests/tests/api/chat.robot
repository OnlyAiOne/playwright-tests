*** Settings ***
Documentation       POST /api/chat: the "Ask OnlyAi" assistant. Each real message costs Claude usage, so the
...                 positive test runs only with ALLOW_WRITES.
Resource            ../../resources/api.resource
Test Tags           chat


*** Test Cases ***
Chat Rejects A Body That Is Not An Object
    [Tags]    negative
    ${response}=    Post JSON    /chat    ${{ [] }}
    Validation Error Should Be    ${response}    model_attributes_type

Chat Rejects GET
    [Tags]    negative
    Method Should Not Be Allowed    GET    /chat

Chat Answers A Question
    [Tags]    writes
    [Setup]    Skip Unless Writes Allowed
    ${session}=    Evaluate    'robotauto-' + __import__('secrets').token_hex(4)
    ${body}=    Create Dictionary    session_id=${session}    message=What are your prices?
    ${response}=    Post JSON    /chat    ${body}
    Status Should Be    200    ${response}
    Should Not Be Empty    ${response.text}
