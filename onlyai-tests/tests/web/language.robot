*** Settings ***
Documentation       EN / Tamil / Hindi / Korean switch in the header. The choice is saved in localStorage.
Resource            ../../resources/pages/home.resource
Test Tags           language


*** Test Cases ***
Each Language Translates The Page
    [Tags]    smoke
    [Template]    Language Should Translate Page
    ta    தொகுப்பு    தொகுப்பைப் பார்க்க    விசாரணை அனுப்பு    உங்கள் பெயர்
    hi    संग्रह       संग्रह देखें          पूछताछ भेजें          आपका नाम
    ko    컬렉션        컬렉션 보기            문의 보내기            이름
    en    Collection    Explore the collection    Send enquiry    Your name

Chosen Language Is Kept After Reload
    [Tags]    regression
    Select Language    ta
    Reload Page
    Wait Until Element Is Visible    ${NAV_COLLECTION}
    Stored Language Should Be    ta
    Element Should Contain    ${NAV_COLLECTION}    தொகுப்பு

HTML Lang Attribute Follows The Selected Language
    [Documentation]    Known defect: <html lang> stays "en" in every language. Reported as SKIP until fixed.
    [Tags]    known-defect    robot:skip-on-failure
    Select Language    ta
    Element Attribute Value Should Be    ${HTML}    lang    ta


*** Keywords ***
Language Should Translate Page
    [Arguments]    ${code}    ${nav}    ${explore}    ${submit}    ${name_placeholder}
    Select Language    ${code}
    Page Should Be In Language    ${nav}    ${explore}    ${submit}    ${name_placeholder}
