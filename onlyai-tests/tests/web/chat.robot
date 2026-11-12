*** Settings ***
Documentation       "Ask OnlyAi" chat panel. Opening, typing and closing send nothing; only the `writes`
...                 test sends a message.
Resource            ../../resources/pages/chat.resource
Test Tags           chat


*** Test Cases ***
Chat Opens With A Greeting And Three Quick Questions
    [Tags]    smoke
    Open Chat
    Element Should Contain    ${CHAT_PANEL}    Ask OnlyAi
    ${questions}=    Quick Questions
    ${expected}=    Create List    What are your prices?    How do I order?    Do you do custom engraving?
    Lists Should Be Equal    ${questions}    ${expected}

Send Is Disabled Until A Question Is Typed
    [Tags]    negative
    Open Chat
    Element Should Be Disabled    ${CHAT_SEND}
    Input Text    ${CHAT_INPUT}    Hello
    Element Should Be Enabled    ${CHAT_SEND}
    # Keys, not Clear Element Text: React only sees the change through keyboard events.
    Press Keys    ${CHAT_INPUT}    CTRL+a    BACKSPACE
    Element Should Be Disabled    ${CHAT_SEND}

Chat Closes Again
    [Tags]    regression
    Open Chat
    Close Chat
    Page Should Contain Element    ${CHAT_OPEN}

Assistant Answers A Quick Question
    [Tags]    writes
    [Setup]    Run Keywords    Skip Unless Writes Allowed    AND    Reset Session
    Open Chat
    Click Button    xpath://*[@data-testid='chat-quick-question'][normalize-space()='What are your prices?']
    Wait Until Element Contains    ${CHAT_MESSAGES}    $    timeout=60s
