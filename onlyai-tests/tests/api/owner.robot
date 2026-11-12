*** Settings ***
Documentation       Owner-only endpoints behind a passcode: GET /api/chat-history and GET /api/enquiries.
...                 Only wrong or missing passcodes are tried; the real passcode is never used or guessed.
Resource            ../../resources/api.resource
Test Tags           owner    security


*** Test Cases ***
Owner Data Is Refused With A Wrong Passcode
    [Tags]    negative
    [Template]    Owner Data Should Be Refused
    chat-history
    enquiries

Owner Data Needs A Passcode
    [Tags]    negative
    [Template]    Owner Data Should Need A Passcode
    chat-history
    enquiries


*** Keywords ***
Owner Data Should Be Refused
    [Arguments]    ${path}
    ${response}=    Get Owner Data    ${path}    robotauto-wrong-passcode
    Detail Should Be    ${response}    401    wrong_passcode

Owner Data Should Need A Passcode
    [Arguments]    ${path}
    ${response}=    Get Owner Data    ${path}    ${None}
    Validation Error Should Be    ${response}    missing
