*** Settings ***
Documentation       Products & prices table and the matching product list in the enquiry form.
Resource            ../../resources/pages/home.resource
Resource            ../../resources/pages/enquiry.resource
Test Tags           pricing


*** Test Cases ***
Price Table Lists Ten Products With Dollar Prices
    [Tags]    smoke
    ${rows}=    Price Table Rows
    Length Should Be    ${rows}    10
    FOR    ${index}    ${row}    IN ENUMERATE    @{rows}    start=1
        Should Be Equal As Integers    ${row}[0]    ${index}
        Should Not Be Empty    ${row}[1]
        Should Match Regexp    ${row}[2]    ^\\$\\d+$
    END

Single Kural And Key Chain Prices Are Correct
    [Tags]    regression
    ${rows}=    Price Table Rows
    Should Be Equal    ${rows}[0][1]    Single Kural in Brass
    Should Be Equal    ${rows}[0][2]    $5
    Should Contain    ${rows}[1][1]    Key chain
    Should Be Equal    ${rows}[1][2]    $2

Enquiry Form Offers Every Product At The Table Price
    [Documentation]    The first 10 form options follow the table order, each ending in "— $<price>".
    [Tags]    regression
    ${rows}=    Price Table Rows
    ${options}=    Product Options
    Length Should Be    ${options}    12
    FOR    ${index}    IN RANGE    10
        Should End With    ${options}[${index}]    — ${rows}[${index}][2]
    END
    Should Be Equal    ${options}[10]    Custom engraving
    Should Be Equal    ${options}[11]    Other

Order On WhatsApp Button Opens The Business Chat
    [Tags]    regression
    Link Should Point To    ${CATALOG_ORDER}
    ...    https://wa.me/${PHONE}?text=Hello%20OnlyAi%20Art%20%26%20Crafts!%20I%20saw%20your%20catalogue%20and%20would%20like%20to%20order.
