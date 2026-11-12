*** Settings ***
Documentation       Owner-only chat history page at /#/history (hash routing: /history without the # shows the home page).
Resource            ../web.resource


*** Variables ***
${HISTORY_PAGE}         css:[data-testid='chat-history-page']
${HISTORY_HEADING}      css:[data-testid='history-heading']
${HISTORY_PASSCODE}     css:[data-testid='history-passcode-input']
${HISTORY_SUBMIT}       css:[data-testid='history-submit-button']
${HISTORY_ERROR}        css:[data-testid='history-error']
${HISTORY_BACK}         css:[data-testid='history-back-link']


*** Keywords ***
Open History Page
    Go To    ${BASE_URL}/#/history
    Wait Until Element Is Visible    ${HISTORY_PASSCODE}

Submit Passcode
    [Arguments]    ${passcode}
    Input Password    ${HISTORY_PASSCODE}    ${passcode}
    Click Button    ${HISTORY_SUBMIT}
