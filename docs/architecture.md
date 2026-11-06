# Automation Architecture

How the onlypps.com test automation works end to end, from a business need written in Jira to proof that the website behaves as expected.

Read the diagram from top to bottom. A business need becomes a Jira story, the story becomes automated tests, the tests are stored in GitHub, the pipeline runs them against the live website, and the results flow into reports and back to the same Jira story.

**Key:** solid border = in place today · dotted border = partly in place · dashed border = planned

```mermaid
flowchart TB
  subgraph BUSINESS["1 · Business and test management · Jira"]
    direction LR
    BR["Business requirement<br/>onlypps.com website"] --> EP["Jira epic<br/>OWA-27"] --> ST["Jira stories<br/>OWA-28 to OWA-35"] --> AC["Acceptance criteria<br/>Given · When · Then"] --> TS["Test scenarios<br/>34 tests"] -.-> SEL["Choose stories to run<br/>(planned)"]:::plan
  end

  subgraph DEV["2 · Automation development · PyCharm"]
    direction LR
    CODE["JavaScript + Playwright Test<br/>in place of Python + Pytest"] --- CFG["Configuration"] --- DATA["Test data<br/>(partial)"]:::part -.- POM["Page objects<br/>(planned)"]:::plan -.- UTIL["Reusable helpers<br/>(planned)"]:::plan
  end

  subgraph SCM["3 · Source code management · GitHub"]
    direction LR
    FB["Feature branch<br/>(planned)"]:::plan -.-> PR["Pull request<br/>(planned)"]:::plan -.-> CR["Code review<br/>(planned)"]:::plan -.-> MAIN["Main branch<br/>today: changes pushed here directly"]
  end

  subgraph CICD["4 · CI/CD execution · GitHub Actions and Jenkins"]
    direction LR
    TRIG["Trigger<br/>every push"] --> DEP["Install<br/>dependencies"] --> BRW["Install<br/>browser"] --> ENV["Environment<br/>(partial)"]:::part --> RUN["Run tests"] --> COL["Collect results"] --> REP["Build reports"] --> FAIL["Failure handling<br/>retry · screenshot · trace"]
  end

  subgraph APP["5 · Application testing · live website"]
    direction LR
    BROW["Real Chrome<br/>browser"] --> SITE["OnlyPPS<br/>website"] --> NAV["Navigate pages<br/>no login needed"] --> WF["Business journeys<br/>forms · services"] --> AS["Assertions"] --> VAL["Behaviour<br/>validated"]
  end

  subgraph EVIDENCE["6 · Reporting and evidence"]
    direction LR
    SUM["Summary<br/>pass · fail · skip · time"] --- FD["Failure<br/>details"] --- SS["Screenshots"] --- TR["Traces<br/>(partial)"]:::part --- HTML["HTML<br/>report"] --- LOG["CI/CD<br/>logs"]
  end

  subgraph JIRA["7 · Jira integration · results go back to the story in layer 1"]
    direction LR
    TRC["Traceability<br/>story key in each test"] --> CAP["Capture status<br/>per story"] --> UPD["Update story comment<br/>(built, needs Jira token)"]:::part --> SUMJ["Add summary<br/>and failure details"]:::part --> ATT["Attach failure screenshots<br/>(built, needs Jira token)"]:::part -.-> READ["Read story, run its tests<br/>(planned)"]:::plan
  end

  BUSINESS ==>|each scenario becomes a test| DEV
  DEV ==>|code is saved and versioned| SCM
  SCM ==>|a change starts the pipeline| CICD
  CICD ==>|tests drive the browser| APP
  APP ==>|results and evidence| EVIDENCE
  EVIDENCE ==>|results mapped by story key| JIRA

  classDef plan stroke-dasharray: 6 4
  classDef part stroke-dasharray: 2 3
```

## The seven layers

| # | Layer | What it does | In place today | Partial or planned |
|---|---|---|---|---|
| 1 | Business and test management | The need is written in Jira as epic OWA-27 with 8 stories and acceptance criteria. | Epic, stories, criteria, 34 scenarios | Choosing which stories to run (planned) |
| 2 | Automation development | Scenarios become Playwright tests, written in PyCharm. | JavaScript + Playwright Test, `playwright.config.js` | Test data lives inside test files (partial); page objects and helpers (planned) |
| 3 | Source code management | All test code is versioned in GitHub. | Repository, `main` branch | Feature branch, pull request, code review (planned) |
| 4 | CI/CD execution | Every push starts a clean run: install, run, collect, report. | GitHub Actions and Jenkins, retries and failure evidence | Environments: production only (partial) |
| 5 | Application testing | A real Chrome browser uses the live site as a visitor would. | Navigation, business journeys, assertions | Login: not applicable on the public site |
| 6 | Reporting and evidence | Each run leaves a summary, failure details, screenshots, an HTML report and logs. | Summary, failures, screenshots, HTML report, CI logs | Traces only on CI retries (partial) |
| 7 | Jira integration | Results are matched to stories by the key in each test name, and the pipeline posts them to each story. | Traceability, status per story key, `scripts/jira-report.js` in GitHub Actions | Story comment and failure screenshots are built but run as a dry run until the Jira secrets are added (partial); reading a story and running only its tests (planned) |

## Notes

- The framework is JavaScript (`@playwright/test`). Python and Pytest were considered, and the decision was to stay on JavaScript.
- Each test title starts with its Jira story key, for example `OWA-31: fills the contact form with sample data`. That key is the link between a test result and its story.
- The contact form is filled but never submitted; requests that would send it are blocked.
