*** Settings ***
Documentation       "Ask OnlyAi" chat panel (powered by Claude). Every sent message costs Claude usage, so
...                 sending is only done by tests tagged `writes`.
Resource            ../web.resource


*** Variables ***
${CHAT_OPEN}            css:[data-testid='chat-open-button']
${CHAT_PANEL}           css:[data-testid='chat-panel']
${CHAT_CLOSE}           css:[data-testid='chat-close-button']
${CHAT_MESSAGES}        css:[data-testid='chat-messages']
${CHAT_QUICK}           css:[data-testid='chat-quick-question']
${CHAT_INPUT}           css:[data-testid='chat-input']
${CHAT_SEND}            css:[data-testid='chat-send-button']


*** Keywords ***
Open Chat
    Wait Until Page Contains Element    ${CHAT_OPEN}
    # The floating button animates in; a script click works whatever stage the animation is at.
    ${button}=    Get WebElement    ${CHAT_OPEN}
    Execute Javascript    arguments[0].click();    ARGUMENTS    ${button}
    Wait Until Element Is Visible    ${CHAT_INPUT}

Close Chat
    Click Button    ${CHAT_CLOSE}
    Wait Until Page Does Not Contain Element    ${CHAT_INPUT}

Quick Questions
    ${elements}=    Get WebElements    ${CHAT_QUICK}
    ${texts}=    Evaluate    [e.text.strip() for e in $elements]
    RETURN    ${texts}
