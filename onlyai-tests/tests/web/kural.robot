*** Settings ***
Documentation       Kural of the day: the section shows the Kural the API returns today.
Resource            ../../resources/pages/home.resource
Resource            ../../resources/api.resource
Test Tags           kural    hybrid


*** Test Cases ***
Kural Of The Day On The Page Matches The API
    [Tags]    smoke
    ${response}=    Get Kural Of Day
    Kural On Page Should Match    ${response.json()}
