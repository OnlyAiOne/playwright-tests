*** Settings ***
Documentation       Browser setup for the onlyai.one web suite (SeleniumLibrary). Selenium Manager fetches
...                 the matching driver, so only the browser itself needs to be installed.
Resource            common.resource
Library             ../libraries/Drivers.py
Library             SeleniumLibrary    timeout=15s    implicit_wait=0s    run_on_failure=Capture Page Screenshot


*** Variables ***
${BROWSER}          chrome
${HEADLESS}         ${True}
${DESKTOP_W}        1366
${DESKTOP_H}        900


*** Keywords ***
Open Site
    ${options}=    Set Variable    add_argument("--window-size=${DESKTOP_W},${DESKTOP_H}")
    IF    ${HEADLESS}
        ${options}=    Set Variable    ${options};add_argument("--headless=new")
    END
    ${driver}=    Driver Path For    ${BROWSER}
    Open Browser    ${BASE_URL}/    ${BROWSER}    options=${options}    executable_path=${driver}

Reset Session
    [Documentation]    Test setup: English, no chat session, desktop size, top of the home page.
    Set Window Size    ${DESKTOP_W}    ${DESKTOP_H}
    Go To    ${BASE_URL}/
    Execute Javascript    window.localStorage.clear();
    Delete All Cookies
    Reload Page
    Wait Until Element Is Visible    css:[data-testid='hero-section']
    Scroll To Top

Scroll To Top
    [Documentation]    The header hides while the page is scrolled down, and a reload keeps the old scroll
    ...    position, so anything in the header needs the page back at the top first.
    Execute Javascript    window.scrollTo(0, 0);
    Wait Until Element Is Visible    css:[data-testid='lang-toggle']

Bring Into View
    [Documentation]    Sections fade in when scrolled to, so scroll first, then wait for them to show.
    [Arguments]    ${locator}
    Wait Until Page Contains Element    ${locator}
    Scroll Element Into View    ${locator}
    Wait Until Element Is Visible    ${locator}

Element Text Should Contain
    [Arguments]    ${locator}    ${expected}
    Bring Into View    ${locator}
    Element Should Contain    ${locator}    ${expected}    ignore_case=True

Text Content Should Contain
    [Documentation]    Reads the DOM text even while an element is faded out or off screen (Selenium's visible
    ...    text is empty then). Use it for "is the right text there", not for "can the user see it".
    [Arguments]    ${locator}    ${expected}
    Wait Until Page Contains Element    ${locator}
    ${text}=    Get Element Attribute    ${locator}    textContent
    Should Contain    ${text}    ${expected}    ignore_case=True

Link Should Point To
    [Arguments]    ${locator}    ${expected}
    Wait Until Page Contains Element    ${locator}
    ${href}=    Get Element Attribute    ${locator}    href
    Should Be Equal    ${href}    ${expected}

Viewport Width Should Not Overflow
    ${overflow}=    Execute Javascript
    ...    return document.documentElement.scrollWidth - window.innerWidth;
    Should Be True    ${overflow} <= 0    Page scrolls sideways by ${overflow}px
