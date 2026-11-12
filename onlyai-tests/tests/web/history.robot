*** Settings ***
Documentation       Owner chat history page. Only a wrong passcode is ever entered.
Resource            ../../resources/pages/history.resource
Test Tags           owner    security


*** Test Cases ***
History Page Asks For The Owner Passcode
    [Tags]    smoke
    Open History Page
    Element Should Contain    ${HISTORY_HEADING}    Chat history
    Element Attribute Value Should Be    ${HISTORY_PASSCODE}    type    password

Wrong Passcode Shows An Error
    [Tags]    negative
    Open History Page
    Submit Passcode    robotauto-wrong-passcode
    Wait Until Element Is Visible    ${HISTORY_ERROR}
    Element Should Contain    ${HISTORY_ERROR}    Wrong passcode

Back Link Returns To The Site
    [Tags]    regression
    Open History Page
    Click Element    ${HISTORY_BACK}
    Wait Until Element Is Visible    css:[data-testid='hero-section']
