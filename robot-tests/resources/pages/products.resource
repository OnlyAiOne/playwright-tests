*** Settings ***
Documentation       /products, /product_details/<id> and /view_cart pages.
Resource            ../web.resource


*** Variables ***
${PRODUCT_NAMES}        css:.features_items .productinfo p
${SEARCH_INPUT}         id:search_product
${SEARCH_BUTTON}        id:submit_search
${RESULTS_TITLE}        css:.features_items h2.title
${DETAIL_INFO}          css:.product-information
${CART_MODAL}           id:cartModal
${CONTINUE_SHOPPING}    css:#cartModal button.close-modal
${CART_ROWS}            css:#cart_info_table tbody tr
${EMPTY_CART}           id:empty_cart


*** Keywords ***
Product Names On Page
    Wait Until Page Contains Element    ${PRODUCT_NAMES}
    ${elements}=    Get WebElements    ${PRODUCT_NAMES}
    ${names}=    Evaluate    [e.text.strip() for e in $elements]
    RETURN    ${names}

Search Products
    [Arguments]    ${term}
    Go To Page    /products
    Input Text    ${SEARCH_INPUT}    ${term}
    Click Button    ${SEARCH_BUTTON}
    Element Text Should Contain    ${RESULTS_TITLE}    Searched Products

Open Product Details
    [Arguments]    ${product_id}
    Go To Page    /product_details/${product_id}
    Wait Until Element Is Visible    ${DETAIL_INFO}

Add Product To Cart
    [Documentation]    Adds from the /products grid and closes the "Added!" dialog.
    [Arguments]    ${product_id}
    Go To Page    /products
    # Hovering a card slides an overlay over its Add to cart button, so a real mouse click lands
    # on whichever is on top mid-animation. A script click on the button fires the same handler.
    ${button}=    Get WebElement    css:.productinfo a.add-to-cart[data-product-id='${product_id}']
    Execute Javascript    arguments[0].click();    ARGUMENTS    ${button}
    Wait Until Element Is Visible    ${CART_MODAL}
    Click Button    ${CONTINUE_SHOPPING}
    Wait Until Element Is Not Visible    ${CART_MODAL}

Open Cart
    Go To Page    /view_cart

Cart Row
    [Arguments]    ${product_id}
    RETURN    css:#cart_info_table tr#product-${product_id}

Cart Quantity Should Be
    [Arguments]    ${product_id}    ${quantity}
    ${row}=    Cart Row    ${product_id}
    Element Text Should Contain    ${row} .cart_quantity    ${quantity}

Remove From Cart
    [Arguments]    ${product_id}
    ${row}=    Cart Row    ${product_id}
    Click Element    ${row} .cart_quantity_delete
    Wait Until Element Is Not Visible    ${row}
