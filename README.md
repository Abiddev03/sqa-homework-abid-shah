# ask.permission.ai — QA Take-Home Submission

Automated test suite and response-evaluation layer for the Permission Agent
(ask.permission.ai), built with Playwright + TypeScript and promptfoo.

## Run it

```bash
npm install
npx playwright install
npm test                # full suite (chromium + firefox), capture excluded
npm run test:chromium   # faster single-browser run
npm run test:headed     # watch it run in a visible browser
npm run capture         # refresh eval/responses.json from the live agent
npm run eval            # promptfoo assertions on captured responses
```

## What's covered

**8 UI tests** (`tests/chat.spec.ts`, `tests/behavior.spec.ts`): the four
required flows (pills visible, topic click → response, free-text → response,
Shift+Enter newline) plus four judgment picks: empty/whitespace input keeps
send disabled, input clears and re-enables after sending, multi-turn
conversation preserves history, and a 375px mobile viewport stays usable.

**Evaluation layer** (`eval/`): live replies are captured to JSON by a
flag-gated spec, then promptfoo asserts invariants on them — see
`assertions.md` for the reasoning.

## Key decisions

- **Two-layer wait for streamed replies:** wait for the ask API response,
  then poll the newest agent bubble until its text stops growing. No fixed
  sleeps; no exact-text matches — replies differ on every run.
- **Locators:** `data-testid` where the app provides it (input, send button);
  role + visible text for pills, which expose only utility classes. Nothing
  is coupled to styling markup.
- **Suggested-topic pills render inconsistently on first load** (observed:
  absent on some fresh sessions, present after refresh). The pill wait
  retries once via reload, and the flakiness is flagged in `ux-review.md`.
- **Capture is separated from the pass/fail suite:** it hits a live LLM to
  collect data, judges nothing, and would slow and destabilize every run —
  so it runs only with `CAPTURE=1`.
- **Workers capped at 2:** every test exercises a live LLM endpoint;
  hammering it with parallel requests is bad testing citizenship.

## With more time

Firefox/WebKit parity for the behavior suite, an authenticated-user test
pack (starting with ux-review finding #1), an LLM-rubric semantic judge on
top of the deterministic eval layer, and CI with the HTML report as a build
artifact.

## Artifacts

`assertions.md` · `ux-review.md` · `data-checks.md` · `ai-workflow.md` ·
`artifacts/report/` (Playwright HTML report) · `artifacts/demo.mp4`
