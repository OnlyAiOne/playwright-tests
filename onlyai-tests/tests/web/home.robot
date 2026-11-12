*** Settings ***
Documentation       Home page: it loads, every section is there, and the menu scrolls to each section.
Resource            ../../resources/pages/home.resource
Test Tags           home


*** Test Cases ***
Home Page Loads With Every Section
    [Tags]    smoke
    Title Should Be    OnlyAi Art & Crafts — Thirukkural preserved in brass
    Element Should Be Visible    ${NAV_BAR}
    Text Content Should Contain    ${HERO_HEADING}    preserved in brass
    FOR    ${section}    IN    @{SECTIONS}
        Page Should Contain Element    css:[data-testid='${section}']
    END

Menu Links Scroll To Their Sections
    [Tags]    regression
    [Template]    Menu Link Should Scroll To
    collection    works-section
    pricing       pricing-section
    studio        about-section
    contact       contact-section

Explore Button Scrolls To The Collection
    [Tags]    regression
    Click Element    ${HERO_EXPLORE}
    Section Should Be In View    works-section

Gallery Shows All Twelve Pieces With Images
    [Tags]    regression
    ${count}=    Get Element Count    css:[data-testid^='gallery-']
    Should Be Equal As Integers    ${count}    12
    Gallery Images Should Be Loaded    12


*** Keywords ***
Menu Link Should Scroll To
    [Arguments]    ${link}    ${section}
    Click Nav Link    ${link}
    Section Should Be In View    ${section}
