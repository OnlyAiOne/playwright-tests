# Automation Architecture

How the onlypps.com test automation works end to end, from a business need written in Jira to proof that the website behaves as expected. There are two views: a business view for stakeholders and a technical view for the team. Both follow the same seven layers.

## Business view

What happens, in which order, grouped into development, execution and reporting. The dotted line is the feedback loop: every result returns to the Jira story it came from.

```mermaid
flowchart TB
  subgraph DEV["DEVELOPMENT"]
    direction LR
    B1["Business requirements<br/>what the website must do"] --> B2["Jira story and<br/>acceptance criteria<br/>OWA-28 to OWA-35"] --> B3["Automation architect /<br/>QA engineer<br/>turns each criterion into a test"] --> B4["PyCharm + JavaScript +<br/>Playwright Test<br/>in place of Python + Pytest"] --> B5["GitHub repository<br/>OnlyAiOne/playwright-tests"]
  end

  subgraph EXE["EXECUTION"]
    direction LR
    B6["GitHub Actions CI/CD<br/>starts on every push"] --> B7["OnlyPPS application<br/>opened in a real<br/>Chrome browser"] --> B8["Test execution<br/>and validation<br/>results are generated here"]
  end

  subgraph REP["REPORTING"]
    direction LR
    B9[("Results, logs, screenshots,<br/>traces, HTML reports<br/>stored in GitHub")] --> B10["Jira story update<br/>results comment and<br/>failure screenshots"] --> B11["Business team<br/>reporting"]
  end

  B5 ==>|a change starts the pipeline| B6
  B8 ==>|results are generated and stored| B9
  B2 -. "⬆ FEEDBACK LOOP ⬆<br/>the result returns to the same Jira story" .- B10
```

## Technical view

The real components in each of the seven layers. Arrows marked "generates" show where results are created; cylinders show where results are stored, and dashed cylinders are temporary (deleted when the CI runner ends, or overwritten on the next local run).

```mermaid
flowchart TB
  subgraph DEVELOPMENT["DEVELOPMENT"]
    subgraph L1["1 · Jira Cloud · OWA space"]
      STORY["Story OWA-28 … OWA-35<br/>description + acceptance criteria"]
    end
    subgraph L2["2 · Engineer workstation · PyCharm"]
      SPECS["Tests + playwright.config.js<br/>JavaScript · Playwright Test 1.64<br/>test names start with the OWA key"]
      LOCALOUT[("Local run: npm run pw:test<br/>report + screenshots on this PC only<br/>overwritten each run")]:::temp
    end
    subgraph L3["3 · GitHub · OnlyAiOne/playwright-tests · public"]
      MAIN[("main branch<br/>source code · permanent")]
    end
  end

  subgraph EXECUTION["EXECUTION"]
    subgraph L4["4 · GitHub Actions runner · temporary Ubuntu machine"]
      TRIG["Trigger<br/>push or pull request to main"] --> SETUP["checkout · Node 20 · npm ci"] --> BRW["playwright install chromium"] --> RUN["npx playwright test<br/>CI=true · 2 retries · 4 in parallel"]
      RUN -->|generates| RAW[("results.json · JUnit XML · test-results/<br/>deleted when the runner ends")]:::temp
      RUN -->|generates| HTML["HTML report<br/>with failure screenshots + traces"]
      RAW --> JR["scripts/jira-report.js<br/>groups results by OWA key"]
    end
    subgraph L5["5 · Application under test"]
      CHROME["Chromium browser"] --> SITE["onlypps.com<br/>live site · no login"]
    end
    JENKINS["Jenkins on the laptop<br/>same suite · checks GitHub every 5 min"]
  end

  subgraph REPORTING["REPORTING"]
    subgraph L6["6 · Result storage"]
      LOGS[("Actions run logs<br/>GitHub default 90 days")]
      ART[("Artifact playwright-report<br/>30 days")]
      JSTORE[("Jenkins builds, reports, archives<br/>last 20 · laptop only")]
    end
    subgraph L7["7 · Jira feedback"]
      API["Jira REST API<br/>secrets JIRA_EMAIL + JIRA_API_TOKEN"]
      CMT[("Results comment on the story<br/>updated every run")]
      ATT[("Failure screenshots<br/>attached to the story")]
    end
    BIZ["Business team<br/>reads the story · opens the report"]
  end

  STORY -->|criteria become tests| SPECS
  SPECS ==>|git push| MAIN
  SPECS -->|generates| LOCALOUT
  MAIN ==>|push event| TRIG
  MAIN -->|polled| JENKINS
  RUN ==>|drives| CHROME
  RUN -->|step output| LOGS
  HTML -->|upload-artifact| ART
  JENKINS -->|stores| JSTORE
  JR ==>|on main only| API
  API --> CMT
  API --> ATT
  CMT --> BIZ
  ART -->|link in the comment| BIZ
  STORY -. "⬆ FEEDBACK LOOP ⬆<br/>results land on the same story" .- CMT

  classDef temp stroke-dasharray: 4 3
```

Planned items (pull requests and code review, page objects, choosing which stories to run) are not drawn. Their status is in the table below.

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
