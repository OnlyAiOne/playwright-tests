*** Settings ***
Documentation       API 1-6: products list, brands list and product search.
Resource            ../../resources/api.resource
Test Tags           products


*** Test Cases ***
API 1: Get All Products List
    [Tags]    smoke    contract
    ${response}=    Get Products List
    ${body}=    Response Should Be    ${response}    200
    Response Should Be Fast    ${response}
    Should Not Be Empty    ${body}[products]
    FOR    ${product}    IN    @{body}[products]
        Product Should Be Valid    ${product}
    END
    Ids Should Be Unique    ${body}[products]

API 1: Every Product Brand Is In The Brands List
    [Tags]    regression
    ${products}=    Get Products List
    ${brands}=    Get Brands List
    ${product_brands}=    Evaluate    {p['brand'] for p in $products.json()['products']}
    ${known_brands}=    Evaluate    {b['brand'] for b in $brands.json()['brands']}
    ${missing}=    Evaluate    sorted($product_brands - $known_brands)
    Should Be Empty    ${missing}    Brands missing from brandsList: ${missing}

API 2: POST To Products List Is Not Supported
    [Tags]    negative
    ${response}=    POST On Session    api    /productsList
    Response Should Be    ${response}    405    ${NOT_SUPPORTED}

API 3: Get All Brands List
    [Tags]    smoke    contract
    ${response}=    Get Brands List
    ${body}=    Response Should Be    ${response}    200
    Response Should Be Fast    ${response}
    Should Not Be Empty    ${body}[brands]
    FOR    ${brand}    IN    @{body}[brands]
        Should Not Be Empty    ${brand}[brand]
    END
    Ids Should Be Unique    ${body}[brands]

API 4: PUT To Brands List Is Not Supported
    [Tags]    negative
    ${response}=    PUT On Session    api    /brandsList
    Response Should Be    ${response}    405    ${NOT_SUPPORTED}

Products List Rejects Other Write Methods
    [Tags]    negative
    [Template]    Method Should Not Be Supported
    PUT       /productsList
    DELETE    /productsList

API 5: Search Product Returns Matches
    [Tags]    smoke
    [Template]    Search Should Return Matches
    top
    tshirt
    jean
    dress
    saree

API 5: Search Is Case Insensitive
    [Tags]    regression
    ${lower}=    Search Product    jean
    ${upper}=    Search Product    JEAN
    Should Be Equal    ${lower.json()}[products]    ${upper.json()}[products]

API 5: Search Results Are A Subset Of All Products
    [Tags]    regression
    ${all}=    Get Products List
    ${found}=    Search Product    top
    ${extra}=    Evaluate
    ...    sorted({p['id'] for p in $found.json()['products']} - {p['id'] for p in $all.json()['products']})
    Should Be Empty    ${extra}    Found by search but not in productsList: ${extra}

API 5: Search With Unknown Term Returns An Empty List
    [Tags]    negative
    ${response}=    Search Product    zzqx-no-such-product
    ${body}=    Response Should Be    ${response}    200
    Should Be Empty    ${body}[products]

API 6: Search Without Parameter
    [Tags]    negative
    ${response}=    POST On Session    api    /searchProduct
    Response Should Be    ${response}    400    Bad request, search_product parameter is missing in POST request.


*** Keywords ***
Method Should Not Be Supported
    [Arguments]    ${method}    ${path}
    ${response}=    Run Keyword    ${method} On Session    api    ${path}
    Response Should Be    ${response}    405    ${NOT_SUPPORTED}

Search Should Return Matches
    [Documentation]    Each result names the term, or is in a category that does (e.g. "jean" finds jeans).
    [Arguments]    ${term}
    ${response}=    Search Product    ${term}
    ${body}=    Response Should Be    ${response}    200
    Should Not Be Empty    ${body}[products]    No products found for "${term}"
    FOR    ${product}    IN    @{body}[products]
        Product Should Be Valid    ${product}
        ${text}=    Evaluate    ($product['name'] + ' ' + $product['category']['category']).lower()
        Should Contain    ${text}    ${term.lower()}
    END
