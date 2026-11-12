*** Settings ***
Documentation       "Send an enquiry" form in the contact section. Submitting a complete form creates a real
...                 enquiry for the business, so only tests tagged `writes` ever submit valid data.
Resource            ../web.resource


*** Variables ***
${ENQUIRY_FORM}         css:[data-testid='enquiry-form']
${ENQUIRY_NAME}         css:[data-testid='enquiry-name-input']
${ENQUIRY_CONTACT}      css:[data-testid='enquiry-contact-input']
${ENQUIRY_PRODUCT}      css:[data-testid='enquiry-product-select']
${ENQUIRY_MESSAGE}      css:[data-testid='enquiry-message-input']
${ENQUIRY_SUBMIT}       css:[data-testid='enquiry-submit-button']
${ENQUIRY_SUCCESS}      css:[data-testid='enquiry-success']
${ENQUIRY_ERROR}        css:[data-testid='enquiry-error']


*** Keywords ***
Open Enquiry Form
    Bring Into View    ${ENQUIRY_FORM}

Fill Enquiry
    [Arguments]    ${name}    ${contact}    ${product}=${None}    ${message}=${EMPTY}
    Open Enquiry Form
    Input Text    ${ENQUIRY_NAME}    ${name}
    Input Text    ${ENQUIRY_CONTACT}    ${contact}
    IF    $product is not None
        Select From List By Value    ${ENQUIRY_PRODUCT}    ${product}
    END
    Input Text    ${ENQUIRY_MESSAGE}    ${message}

Submit Enquiry
    Click Button    ${ENQUIRY_SUBMIT}

Product Options
    ${options}=    Get List Items    ${ENQUIRY_PRODUCT}    values=True
    RETURN    ${options}

Field Should Be Invalid
    [Documentation]    The browser's own required-field check: the form is not sent while this is true.
    [Arguments]    ${locator}
    ${field}=    Get WebElement    ${locator}
    ${message}=    Execute Javascript    return arguments[0].validationMessage;    ARGUMENTS    ${field}
    Should Not Be Empty    ${message}    ${locator} should be invalid but has no validation message

Enquiry Should Not Have Been Sent
    Page Should Not Contain Element    ${ENQUIRY_SUCCESS}
    Element Should Be Visible    ${ENQUIRY_FORM}
