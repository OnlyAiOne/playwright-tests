*** Settings ***
Documentation       The one-page home site: navigation, language switch, Kural of the day, gallery,
...                 price table and contact links. Every locator uses the site's own data-testid.
Resource            ../web.resource


*** Variables ***
${NAV_BAR}              css:[data-testid='nav-bar']
${HERO}                 css:[data-testid='hero-section']
${HERO_HEADING}         css:[data-testid='hero-heading-reveal']
${HERO_EXPLORE}         css:[data-testid='hero-cta-explore']
${HERO_CALL}            css:[data-testid='hero-cta-call']
${NAV_COLLECTION}       css:[data-testid='nav-link-collection']
${KURAL_SECTION}        css:[data-testid='kural-of-day-section']
${KURAL_LINE_1}         css:[data-testid='kural-line-1']
${KURAL_LINE_2}         css:[data-testid='kural-line-2']
${KURAL_ENGLISH}        css:[data-testid='kural-english']
${KURAL_DETAILS_EN}     css:[data-testid='kural-details-en']
${GALLERY}              css:[data-testid='works-gallery']
${PRICE_TABLE}          css:[data-testid='price-table']
${PRICE_ROWS}           css:[data-testid^='price-row-']
${CATALOG_ORDER}        css:[data-testid='catalog-order-button']
${CONTACT_PHONE}        css:[data-testid='contact-phone-link']
${CONTACT_EMAIL}        css:[data-testid='contact-email-link']
${CONTACT_EMAIL_HEAD}   css:[data-testid='contact-email-heading']
${WHATSAPP_FLOAT}       css:[data-testid='whatsapp-order-button']
${HTML}                 css:html
@{SECTIONS}             hero-section    marquee-section    kural-of-day-section    about-section
...                     works-section    pricing-section    process-section    contact-section    footer


*** Keywords ***
# --- Navigation ---

Click Nav Link
    [Arguments]    ${name}
    Scroll To Top
    Click Element    css:[data-testid='nav-link-${name}']

Section Should Be In View
    [Documentation]    The section's top edge is within the upper half of the window (smooth scroll may still be settling).
    [Arguments]    ${testid}
    Wait Until Keyword Succeeds    5x    500ms    Section Top Should Be Near Top    ${testid}

Section Top Should Be Near Top
    [Arguments]    ${testid}
    ${top}=    Execute Javascript
    ...    return Math.round(document.querySelector("[data-testid='${testid}']").getBoundingClientRect().top);
    ${half}=    Execute Javascript    return Math.round(window.innerHeight / 2);
    Should Be True    -10 <= ${top} <= ${half}    ${testid} top is at ${top}px, expected 0-${half}px

# --- Language ---

Select Language
    [Arguments]    ${code}
    Scroll To Top
    Click Button    css:[data-testid='lang-${code}-button']
    Wait Until Keyword Succeeds    5x    300ms    Stored Language Should Be    ${code}

Stored Language Should Be
    [Arguments]    ${code}
    ${stored}=    Execute Javascript    return window.localStorage.getItem('onlyai-lang');
    Should Be Equal    ${stored}    ${code}

Page Should Be In Language
    [Documentation]    Checks the menu, hero button, form button and form placeholder.
    [Arguments]    ${nav}    ${explore}    ${submit}    ${name_placeholder}
    Text Content Should Contain    ${NAV_COLLECTION}    ${nav}
    Text Content Should Contain    ${HERO_EXPLORE}    ${explore}
    Text Content Should Contain    css:[data-testid='enquiry-submit-button']    ${submit}
    Element Attribute Value Should Be    css:[data-testid='enquiry-name-input']    placeholder    ${name_placeholder}

# --- Kural of the day ---

Kural On Page Should Match
    [Arguments]    ${kural}
    Bring Into View    ${KURAL_SECTION}
    Element Text Should Be    ${KURAL_LINE_1}    ${kural}[tamil_line1]
    Element Text Should Be    ${KURAL_LINE_2}    ${kural}[tamil_line2]
    Element Should Contain    ${KURAL_ENGLISH}    ${kural}[english]
    Element Should Contain    ${KURAL_DETAILS_EN}    KURAL ${kural}[number]    ignore_case=True

# --- Gallery and prices ---

Gallery Images Should Be Loaded
    [Documentation]    Images load lazily, so each gallery card is scrolled into view before checking.
    [Arguments]    ${count}
    FOR    ${i}    IN RANGE    1    ${count} + 1
        Bring Into View    css:[data-testid='gallery-${i}']
        Wait Until Keyword Succeeds    10x    500ms    Image Should Be Loaded    css:[data-testid='gallery-${i}'] img
    END

Image Should Be Loaded
    [Arguments]    ${locator}
    ${img}=    Get WebElement    ${locator}
    ${ok}=    Execute Javascript    return arguments[0].complete && arguments[0].naturalWidth > 0;    ARGUMENTS    ${img}
    Should Be True    ${ok}    Image not loaded: ${locator}
    ${alt}=    Get Element Attribute    ${locator}    alt
    Should Not Be Empty    ${alt}    Image has no alt text: ${locator}

Price Table Rows
    [Documentation]    Returns [[no, product, price], ...] in table order.
    Bring Into View    ${PRICE_TABLE}
    ${rows}=    Execute Javascript
    ...    return [...document.querySelectorAll("[data-testid^='price-row-']")].map(r => [...r.cells].map(c => c.innerText.trim()));
    RETURN    ${rows}
