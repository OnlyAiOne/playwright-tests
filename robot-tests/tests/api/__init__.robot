*** Settings ***
Documentation       API suite: all 14 APIs on https://automationexercise.com/api_list.
Resource            ../../resources/api.resource
Suite Setup         Create API Session
Suite Teardown      Delete All Sessions
Test Tags           api
