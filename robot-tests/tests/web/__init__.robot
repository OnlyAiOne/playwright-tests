*** Settings ***
Documentation       Web suite: automationexercise.com in a real browser, with the API used to set up
...                 test data and to check what the UI stored.
Resource            ../../resources/web.resource
Resource            ../../resources/api.resource
Suite Setup         Run Keywords    Create API Session    AND    Open Site
Suite Teardown      Run Keywords    Close All Browsers    AND    Delete All Sessions
Test Setup          Reset Session
Test Tags           web
