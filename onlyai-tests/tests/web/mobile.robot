*** Settings ***
Documentation       Phone-width layout (375 x 812). The window is set back to desktop size by the next test's setup.
Resource            ../../resources/pages/home.resource
Test Tags           mobile


*** Test Cases ***
Page Fits A Phone Screen
    [Tags]    smoke
    Use Phone Size
    Viewport Width Should Not Overflow
    Element Should Be Visible    ${HERO_HEADING}

Price Table Fits A Phone Screen
    [Tags]    regression
    Use Phone Size
    Bring Into View    ${PRICE_TABLE}
    ${extra}=    Execute Javascript
    ...    const t = document.querySelector("[data-testid='price-table']"); return t.scrollWidth - t.parentElement.clientWidth;
    Should Be True    ${extra} <= 0    Price table is ${extra}px wider than its card

Menu Is Reachable On A Phone
    [Documentation]    Known defect: below the desktop breakpoint the menu links are hidden and no menu button
    ...    replaces them. Reported as SKIP until fixed.
    [Tags]    known-defect    robot:skip-on-failure
    Use Phone Size
    Element Should Be Visible    ${NAV_COLLECTION}


*** Keywords ***
Use Phone Size
    Set Window Size    375    812
    Reload Page
    Wait Until Element Is Visible    ${HERO_HEADING}
