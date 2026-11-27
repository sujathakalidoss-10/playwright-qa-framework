# Test Design Explanation

A quick-look summary of what's tested, why, and what's next. (Full code detail: [STEP_BY_STEP_GUIDE.md](STEP_BY_STEP_GUIDE.md).)

## 1. Key design choices

| Choice | Why |
|---|---|
| Playwright + TypeScript, one project | One tool for API and UI, one report, type safety |
| Separate `api` / `ui` projects | Run independently; API tests need no browser, so they're fast |
| Page Object Model | Locators in one place, no assertions in page objects |
| Service object (`PetClient`) | Tests say what they mean (`petClient.create(pet)`), not raw URLs |
| Custom fixtures | Auto clean-up of test data, even when a test fails |
| Builder pattern for test data | Valid-by-default objects; override only what the test cares about |
| zod schemas | API responses are checked against the real contract, not just "it returned something" |
| Data-driven tests | A new case is a new row, not new code |
| Tags (`@smoke`, `@negative`) | Run a quick subset, or everything |
| Annotations (`defect`, `risk`) | The report explains *why* a test exists, not just pass/fail |

## 2. API test – `POST /pet`

**Why this endpoint:** creating a pet is the root of everything else (find, update, delete all depend on it), and it has the richest input to validate.

| Scenario | Type | Proves |
|---|---|---|
| Create a pet, read it back | Positive, smoke | Data is actually saved, not just acknowledged |
| Every status value accepted | Positive | All documented options work |
| Malformed JSON | Negative | Refused with 400, no crash |
| Wrong data type for id | Negative | Refused, not silently accepted |
| Missing required fields | Negative, known defect | Spec says this should fail — Petstore accepts it anyway. Flagged so we're alerted if it's ever fixed |
| Unknown id | Negative | Clean 404 |
| Non-numeric id | Negative | Refused (API differs slightly from spec here — noted, not hidden) |

One extra trick worth knowing: reading a pet back right after creating it can briefly 404 (the public demo is eventually consistent), so the read-back polls for up to 15s instead of a fixed wait.

Code: [tests/api/pet.api.spec.ts](../tests/api/pet.api.spec.ts)

## 3. UI tests – OrangeHRM

All UI tests log in once (a setup step saves the session) and reuse it — except the login tests, which start logged out on purpose.

**Login** — the gate to everything else, and where security behaviour (generic errors, protected routes) lives.

| Scenario | Type | Proves |
|---|---|---|
| Valid login → dashboard → logout | Positive, smoke | The full session works end to end |
| Wrong password / unknown username | Negative | Same generic error either way (no hints for attackers) |
| SQL-injection style input | Negative | Rejected cleanly |
| Password with extra spaces | Negative | Compared exactly, not trimmed |
| Empty submit | Negative | Client-side "Required" validation |
| Dashboard without a session | Negative | Redirected to login |

Code: [tests/ui/login.ui.spec.ts](../tests/ui/login.ui.spec.ts)

**PIM — add an employee, find them in the list** — the core job of an HR system.

| Scenario | Type | Proves |
|---|---|---|
| Add employee → saved → found by search | Positive, smoke | The full journey: form, save, search |
| Empty form | Negative | "Required" on first/last name |
| Duplicate Employee Id | Negative | Rejected as soon as it's typed |
| Search for an id that doesn't exist | Negative | Clean "No Records Found" |

Code: [tests/ui/employee.ui.spec.ts](../tests/ui/employee.ui.spec.ts)

## 4. API vs UI — when to use which

**Rule of thumb:** test the *rule* at the lowest layer that can prove it. Use the UI only to prove a person can actually do it on screen.

| Goes to... | Examples |
|---|---|
| **API** | Validation rules, status codes, security/auth, data setup for a UI test, logging in (once, via saved session) |
| **UI** | Rendering, navigation, client-side checks, the one critical end-to-end journey |

Example: "a pet with no name is rejected" is tested at the API — a browser adds nothing but slowness. Login *must* be a UI test, because the risk is in the form and redirect itself.

## 5. What I'd test next (if I had more time)

Priority = impact × likelihood. Full backlog of 30+ ideas is tracked separately; the highlights:

**Petstore API**
- Full lifecycle: create → update → delete → confirm gone
- Writes with no auth/API key (should be refused)
- Concurrent updates to the same pet (lost-update check)

**OrangeHRM UI**
- Role-based access: a normal employee must never see admin menus/pages
- Simulated server errors (mocked 500) — does the UI show a real error message?
- Back button after logout shouldn't reveal a cached private page

## 6. Challenges and trade-offs

- **Shared, eventually-consistent public demo** → unique ids per test, polling instead of fixed waits, clean-up fixtures
- **API doesn't always match its own spec** → tests assert the behaviour that matters (e.g. "refused" not "exactly 400"), and record the deviation instead of hiding it or always failing
- **One-hour time-box** → depth over breadth: one endpoint and one feature done properly, rest captured as a prioritised backlog
- **Logging in before every UI test doesn't scale** → log in once, reuse the session
- **Slow demo site** → generous but bounded timeouts, retries only in CI (so local runs show real flakiness)
