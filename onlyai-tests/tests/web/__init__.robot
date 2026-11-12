*** Settings ***
Documentation       Web suite: onlyai.one in a real browser, with the API used to check what the page shows.
Resource            ../../resources/web.resource
Resource            ../../resources/api.resource
Suite Setup         Run Keywords    Create API Session    AND    Open Site
Suite Teardown      Run Keywords    Close All Browsers    AND    Delete All Sessions
Test Setup          Reset Session
Test Tags           web
