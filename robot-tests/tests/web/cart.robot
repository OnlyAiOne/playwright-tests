*** Settings ***
Documentation       Cart as a guest: add, quantities, prices and remove. Never checks out.
Resource            ../../resources/pages/products.resource
Resource            ../../resources/api.resource
Test Tags           cart


*** Test Cases ***
Add Two Products To The Cart
    [Tags]    smoke
    Add Product To Cart    1
    Add Product To Cart    2
    Open Cart
    ${rows}=    Get Element Count    ${CART_ROWS}
    Should Be Equal As Integers    ${rows}    2
    Cart Row Should Match API Product    1
    Cart Row Should Match API Product    2

Adding The Same Product Twice Increases The Quantity
    [Tags]    regression
    Add Product To Cart    1
    Add Product To Cart    1
    Open Cart
    Cart Quantity Should Be    1    2
    ${row}=    Cart Row    1
    ${price}=    Get Text    ${row} .cart_price
    ${total}=    Get Text    ${row} .cart_total_price
    ${expected}=    Evaluate    'Rs. %d' % (2 * int($price.split()[-1]))
    Should Be Equal    ${total}    ${expected}

Remove A Product From The Cart
    [Tags]    regression
    Add Product To Cart    1
    Open Cart
    Remove From Cart    1
    Wait Until Element Is Visible    ${EMPTY_CART}


*** Keywords ***
Cart Row Should Match API Product
    [Arguments]    ${product_id}
    ${response}=    Get Products List
    ${product}=    Evaluate    next(p for p in $response.json()['products'] if p['id'] == ${product_id})
    ${row}=    Cart Row    ${product_id}
    Element Text Should Contain    ${row} .cart_description    ${product}[name]
    Element Text Should Contain    ${row} .cart_price    ${product}[price]
    Cart Quantity Should Be    ${product_id}    1
