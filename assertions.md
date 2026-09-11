# Assertions on a Non-Deterministic Agent

The agent's reply to the same question differs on every run — verified by
comparing consecutive captures: same questions, differently worded answers.
So the suite never asserts exact text. Every assertion targets an
**invariant**: a property that holds across healthy replies but breaks when
the system degrades.

## UI layer (Playwright)

**Waiting strategy — two layers, no fixed sleeps.** A reply is "done" when
(1) the ask API request returns OK — the answer exists — and (2) the newest
agent bubble's text stops growing for 1.5s — the streaming animation has
finished. Layer 1 is network-truth; layer 2 is what the user sees. A fixed
sleep is either too short (flaky) or too long (slow), and cannot distinguish
"finished" from "stalled".

**The UI tests assert:** a new agent bubble appears per trigger; its settled
text is non-trivial; the input returns to a ready state; history is
preserved across turns. None of it depends on wording.

## Response layer (promptfoo, deterministic by design)

Captured live replies are checked against three invariant classes:

- **Length window (80–3000 chars):** catches empty, truncated, and runaway
  replies.
- **Error leakage** (`error`, `something went wrong`, `undefined`…): a reply
  surfacing infrastructure noise fails regardless of length.
- **Domain vocabulary:** each answer must touch its question's stable
  vocabulary — an earning answer that never mentions earn/ASK/token/share
  has drifted off-topic. Keywords were derived from observed captured
  responses, not assumptions.

**Fails when worse, holds when different:** a reworded healthy answer passes;
an empty reply, leaked error, or off-topic essay fails at least one check.

**Trade-off:** deterministic-only means zero dependencies and no API key.
The natural next layer is an LLM-rubric judge; the capture → assert pipeline
is already shaped for it.
