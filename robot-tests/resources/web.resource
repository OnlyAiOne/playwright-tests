*** Settings ***
Documentation       Browser setup for the web suite (SeleniumLibrary). Selenium Manager fetches the
...                 matching driver, so only the browser itself needs to be installed.
Resource            common.resource
Library             ../libraries/Drivers.py
Library             SeleniumLibrary    timeout=15s    implicit_wait=0s    run_on_failure=Capture Page Screenshot


*** Variables ***
${BROWSER}          chrome
${HEADLESS}         ${True}
# The site loads many ad scripts, and full-page ads appear between pages. Resolving the ad
# hosts to nowhere keeps the tests fast and stops ads covering the elements under test.
@{AD_HOSTS}         *.googlesyndication.com    *.doubleclick.net    *.googleadservices.com
...                 *.adservice.google.com    *.fundingchoicesmessages.google.com    *.googletagservices.com


*** Keywords ***
Open Site
    ${rules}=    Evaluate    ', '.join(f'MAP {host} 0.0.0.0' for host in $AD_HOSTS)
    ${options}=    Set Variable    add_argument("--host-resolver-rules=${rules}");add_argument("--window-size=1366,900")
    IF    ${HEADLESS}
        ${options}=    Set Variable    ${options};add_argument("--headless=new")
    END
    ${driver}=    Driver Path For    ${BROWSER}
    Open Browser    ${BASE_URL}    ${BROWSER}    options=${options}    executable_path=${driver}
    Set Selenium Speed    0s

Go To Page
    [Arguments]    ${path}
    Go To    ${BASE_URL}${path}

Reset Session
    [Documentation]    Test setup: each test starts signed out with an empty cart.
    Delete All Cookies
    Go To Page    /

Element Text Should Contain
    [Arguments]    ${locator}    ${expected}
    Wait Until Element Is Visible    ${locator}
    Element Should Contain    ${locator}    ${expected}    ignore_case=True
