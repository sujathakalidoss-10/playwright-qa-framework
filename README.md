# Playwright QA Framework – Petstore API + OrangeHRM UI

One Playwright + TypeScript project covering:

| Layer | System under test | Spec file |
|---|---|---|
| **API** | [Swagger Petstore](https://petstore.swagger.io) – `POST /pet` (+ `GET /pet/{petId}` read-back) | [tests/api/pet.api.spec.ts](tests/api/pet.api.spec.ts) |
| **UI** | [OrangeHRM demo](https://opensource-demo.orangehrmlive.com) – Login / Logout / access control | [tests/ui/login.ui.spec.ts](tests/ui/login.ui.spec.ts) |
| **UI** | OrangeHRM – PIM: add an employee and find them in the employee list | [tests/ui/employee.ui.spec.ts](tests/ui/employee.ui.spec.ts) |

**Test Design Explanation:** **[docs/TEST_DESIGN.md](docs/TEST_DESIGN.md)**. It covers the approach and rationale for every positive and negative scenario implemented, when to test at the API layer instead of the UI, and a prioritised backlog of further scenarios.
How the project was built, step by step, is in **[docs/STEP_BY_STEP_GUIDE.md](docs/STEP_BY_STEP_GUIDE.md)**.

---

## 1. Prerequisites

- **Node.js 20+** (LTS) – includes `npm`
- Internet access (both systems under test are public demo sites)

### Dependencies

All are dev dependencies in [package.json](package.json) and are installed by `npm install`. Nothing needs to be installed globally.

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | ^1.49.0 | Test runner, browser automation (UI) and HTTP client (API) |
| `typescript` | ^5.6.3 | Type checking (`npm run typecheck`) |
| `zod` | ^3.23.8 | Runtime schema validation of API responses |
| `dotenv` | ^16.4.5 | Loads optional overrides from a `.env` file |
| `@types/node` | ^22.10.0 | Node.js type definitions |

## 2. Set up

```bash
git clone <repository-url>   # or unzip the submitted archive
cd playwright-qa-framework
npm install                  # installs the dependencies above
npm run setup                # downloads the Chromium browser used by UI tests
```

On a fresh **Linux** machine (or a minimal container), install the browser's system libraries too:

```bash
npx playwright install --with-deps chromium
```

Windows and macOS need no extra step.

### Environment variables (optional)

All settings have defaults in [config/env.ts](config/env.ts), so **no `.env` is needed**.
To point at another environment, copy `.env.example` to `.env` and edit:

| Variable | Default |
|---|---|
| `PETSTORE_BASE_URL` | `https://petstore.swagger.io/v2/` (keep the trailing slash) |
| `PETSTORE_API_KEY` | `special-key` |
| `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_USERNAME` / `ORANGEHRM_PASSWORD` | public demo credentials shown on the OrangeHRM login page |

## 3. Run

| Command | What it does |
|---|---|
| `npm test` | Run everything (API + UI) |
| `npm run test:api` | API tests only (no browser needed, ~seconds) |
| `npm run test:ui` | UI tests only (headless Chromium) |
| `npm run test:ui:headed` | UI tests with a visible browser – good for demos |
| `npm run test:smoke` | Only tests tagged `@smoke` |
| `npm run test:negative` | Only tests tagged `@negative` |
| `npm run typecheck` | TypeScript compile check |

## 4. Reports

| Output | Location |
|---|---|
| Console | `list` reporter – one line per test |
| HTML report | `reports/html/index.html` – open with `npm run report` |
| JUnit XML (for CI dashboards) | `reports/junit/results.xml` |
| Trace / screenshot / video on failure | `test-results/` (and linked from the HTML report) |

Annotations such as `defect`, `spec-deviation` and `risk` appear on each test in the HTML report.

## 5. Project structure

```
├── config/env.ts                 # single source of environment config
├── playwright.config.ts          # 'api' and 'ui' projects, reporters, retries, artefacts
├── src/
│   ├── api/
│   │   ├── clients/petClient.ts  # API service object - wraps /pet endpoints
│   │   ├── models/pet.ts         # zod schemas = types + runtime contract checks
│   │   └── builders/petBuilder.ts# test-data builder with unique ids
│   ├── ui/
│   │   ├── pages/                # Page Objects (Base, Login, Dashboard, AddEmployee, EmployeeList)
│   │   └── api/employeeClient.ts # OrangeHRM REST API - seeding and clean-up for UI tests
│   ├── data/
│   │   ├── loginData.ts          # data-driven negative login cases
│   │   └── employeeData.ts       # employee builder with unique Employee Ids
│   └── fixtures/index.ts         # custom fixtures: DI + automatic clean-up
├── tests/
│   ├── api/pet.api.spec.ts       # API tests
│   └── ui/
│       ├── auth.setup.ts         # logs in once, saves the session for the other UI tests
│       ├── login.ui.spec.ts      # UI tests - login
│       └── employee.ui.spec.ts   # UI tests - PIM employees
├── docs/
│   ├── TEST_DESIGN.md            # Test Design Explanation: rationale + prioritised future scenarios
│   └── STEP_BY_STEP_GUIDE.md     # how the framework was built, step by step
└── .github/workflows/tests.yml   # CI: API and UI jobs in parallel, reports uploaded
```

## 6. Known behaviours of the public sandboxes

- **Petstore is shared and eventually consistent** – a pet may not be readable immediately after creation. The read-back uses `expect.poll` instead of a fixed sleep.
- **Petstore does not enforce required fields** – documented by a `test.fail()` test tagged `@known-defect`.
- **UI tests log in once.** The `ui-setup` project logs in and saves the session to `.auth/admin.json` (git-ignored); `npm run test:ui` runs it automatically first. Login tests start with no session.
- **UI tests clean up after themselves** – employees they create are deleted through OrangeHRM's REST API, even when a test fails.
- **The OrangeHRM demo resets periodically** and can be slow; timeouts are set accordingly and CI retries up to twice (locally, retries are off so flakiness is visible).
# playwright-qa-framework
