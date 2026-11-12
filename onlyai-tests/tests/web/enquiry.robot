*** Settings ***
Documentation       "Send an enquiry" form. Required-field checks stop the form in the browser, so nothing is
...                 sent; only the `writes` test submits a complete enquiry.
Resource            ../../resources/pages/enquiry.resource
Test Tags           enquiry


*** Test Cases ***
Empty Enquiry Is Not Sent
    [Tags]    negative    smoke
    Open Enquiry Form
    Submit Enquiry
    Field Should Be Invalid    ${ENQUIRY_NAME}
    Enquiry Should Not Have Been Sent

Enquiry Without Contact Details Is Not Sent
    [Tags]    negative
    Open Enquiry Form
    Input Text    ${ENQUIRY_NAME}    Robot Automation Test
    Submit Enquiry
    Field Should Be Invalid    ${ENQUIRY_CONTACT}
    Enquiry Should Not Have Been Sent

Product And Message Are Optional
    [Tags]    regression
    Open Enquiry Form
    Element Attribute Value Should Be    ${ENQUIRY_PRODUCT}    required    ${None}
    Element Attribute Value Should Be    ${ENQUIRY_MESSAGE}    required    ${None}

Valid Enquiry Shows A Thank-You Message
    [Tags]    writes
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    Fill Enquiry    Robot Automation Test    robotauto@example.com    Other    Automated test enquiry, please ignore.
    Submit Enquiry
    Wait Until Element Is Visible    ${ENQUIRY_SUCCESS}
    Page Should Not Contain Element    ${ENQUIRY_ERROR}
