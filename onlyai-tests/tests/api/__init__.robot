*** Settings ***
Documentation       API suite for the onlyai.one backend: Kural of the day, enquiry, chat and owner history.
Resource            ../../resources/api.resource
Suite Setup         Create API Session
Suite Teardown      Delete All Sessions
Test Tags           api
