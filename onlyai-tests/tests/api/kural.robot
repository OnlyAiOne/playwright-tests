*** Settings ***
Documentation       GET /api/kural-of-day: the Thirukkural shown in the "Kural of the day" section.
Resource            ../../resources/api.resource
Test Tags           kural


*** Test Cases ***
Kural Of The Day Returns A Valid Kural
    [Tags]    smoke    contract
    ${response}=    Get Kural Of Day
    Status Should Be    200    ${response}
    Response Should Be JSON    ${response}
    Response Should Be Fast    ${response}
    Kural Should Be Valid    ${response.json()}

Kural Of The Day Is For Today
    [Documentation]    The server may run on a different time zone, so one day either side is accepted.
    [Tags]    regression
    ${response}=    Get Kural Of Day
    ${today}=    Get Current Date    result_format=%Y-%m-%d
    ${diff}=    Subtract Date From Date    ${response.json()}[date]    ${today}    date1_format=%Y-%m-%d    date2_format=%Y-%m-%d
    Should Be True    abs(${diff}) <= 86400    Kural date ${response.json()}[date] is not around today (${today})

Kural Of The Day Is The Same On Every Call
    [Tags]    regression
    ${first}=    Get Kural Of Day
    ${second}=    Get Kural Of Day
    Should Be Equal    ${first.json()}[number]    ${second.json()}[number]
    Should Be Equal    ${first.json()}[date]    ${second.json()}[date]

Kural Of The Day Rejects POST
    [Tags]    negative
    Method Should Not Be Allowed    POST    /kural-of-day
