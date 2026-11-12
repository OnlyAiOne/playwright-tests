*** Settings ***
Documentation       Contact details and links. Links are checked by their address only; nothing is dialled or sent.
Resource            ../../resources/pages/home.resource
Test Tags           contact


*** Test Cases ***
Phone Links Call The Business
    [Tags]    smoke
    [Template]    Link Should Point To
    ${HERO_CALL}        tel:+${PHONE}
    ${CONTACT_PHONE}    tel:+${PHONE}

Email Links Open A Mail To The Business
    [Tags]    regression
    [Template]    Link Should Point To
    ${CONTACT_EMAIL}        mailto:${EMAIL}
    ${CONTACT_EMAIL_HEAD}   mailto:${EMAIL}

Floating WhatsApp Button Opens In A New Tab
    [Tags]    regression
    Link Should Point To    ${WHATSAPP_FLOAT}
    ...    https://wa.me/${PHONE}?text=Hello%20OnlyAi%20Art%20%26%20Crafts!%20I%20would%20like%20to%20enquire%20about%20your%20brass%20engraved%20products.
    Element Attribute Value Should Be    ${WHATSAPP_FLOAT}    target    _blank

Contact Section Shows Address, Countries And GSTIN
    [Tags]    regression
    Element Text Should Contain    css:[data-testid='contact-location-text']    Chennai 600122
    Element Text Should Contain    css:[data-testid='contact-availability-text']    India
    Element Text Should Contain    css:[data-testid='contact-gstin-text']    33AYPPS9210B1ZG
