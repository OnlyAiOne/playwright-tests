*** Settings ***
Documentation       POST /api/enquiry: the "Send an enquiry" form. Invalid bodies are rejected by validation
...                 before anything is saved; a valid enquiry reaches the business, so it runs only with ALLOW_WRITES.
Resource            ../../resources/api.resource
Test Tags           enquiry


*** Test Cases ***
Enquiry Rejects A Body That Is Not An Object
    [Tags]    negative
    [Template]    Enquiry Body Should Be Rejected
    ${{ [] }}
    ${{ "just text" }}

Enquiry Rejects GET
    [Tags]    negative
    Method Should Not Be Allowed    GET    /enquiry

Enquiry With Valid Details Is Accepted
    [Tags]    writes
    [Setup]    Skip Unless Writes Allowed
    ${response}=    Send Enquiry    Robot Automation Test    robotauto@example.com    Other
    ...    Automated test enquiry, please ignore.
    Should Be True    ${response.status_code} in (200, 201)    Enquiry failed: ${response.status_code} ${response.text}


*** Keywords ***
Enquiry Body Should Be Rejected
    [Arguments]    ${body}
    ${response}=    Post JSON    /enquiry    ${body}
    Validation Error Should Be    ${response}    model_attributes_type
