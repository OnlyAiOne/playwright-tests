*** Settings ***
Documentation       Product listing, search and details, compared with the API.
Resource            ../../resources/pages/products.resource
Resource            ../../resources/api.resource
Test Tags           products


*** Test Cases ***
Products Shown In The UI Exist In The API
    [Tags]    smoke    hybrid
    Go To Page    /products
    ${ui_names}=    Product Names On Page
    Should Not Be Empty    ${ui_names}
    ${response}=    Get Products List
    ${api_names}=    Evaluate    {p['name'] for p in $response.json()['products']}
    ${missing}=    Evaluate    sorted(set($ui_names) - $api_names)
    Should Be Empty    ${missing}    Shown in the UI but missing from the API: ${missing}

UI Search Shows The Same Products As The API Search
    [Tags]    regression    hybrid
    [Template]    UI Search Should Match API Search
    top
    jean
    dress

Product Details Match The API
    [Tags]    regression    hybrid
    ${response}=    Get Products List
    ${product}=    Set Variable    ${response.json()}[products][0]
    Open Product Details    ${product}[id]
    Element Text Should Contain    ${DETAIL_INFO} h2    ${product}[name]
    Element Text Should Contain    ${DETAIL_INFO}    ${product}[price]
    Element Text Should Contain    ${DETAIL_INFO}    Brand: ${product}[brand]
    Element Text Should Contain    ${DETAIL_INFO}    Category: ${product}[category][usertype][usertype] > ${product}[category][category]


*** Keywords ***
UI Search Should Match API Search
    [Arguments]    ${term}
    Search Products    ${term}
    ${ui_names}=    Product Names On Page
    ${response}=    Search Product    ${term}
    ${api_names}=    Evaluate    [p['name'] for p in $response.json()['products']]
    Lists Should Be Equal    ${ui_names}    ${api_names}    ignore_order=True
