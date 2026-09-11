# Assertions on a Non-Deterministic Agent

The agent's reply to the same question differs on every run — verified by
capturing consecutive responses: same questions, differently worded answers.
So the suite never asserts exact text. Every assertion targets an
**invariant**: a property that holds across all healthy replies but breaks
when the system degrades.

## UI layer (Playwright)

**Waiting strategy — two layers, no fixed sleeps.** A reply is "done" when
(1) the ask API request returns OK — the answer exists — and then
(2) the newest agent bubble's text stops growing for 1.5s — the streaming
animation has finished. Layer 1 is network-truth; layer 2 is what the user
actually sees. A fixed sleep would be either too short (flaky) or too long
(slow), and would still not distinguish "finished" from "stalled".

**What the UI tests assert:** a new agent bubble appears after each trigger;
its settled text is non-trivial (length floor); the input returns to a
ready state; conversation history is preserved across turns. None of this
depends on wording.

## Response layer (promptfoo, deterministic by design)

Captured live replies are checked against three invariant classes:

- **Length window (80–3000 chars):** catches empty, truncated, and runaway
  replies. Healthy answers vary in wording but live in a stable size band.
- **Error leakage (`error`, `something went wrong`, `undefined`…):** a reply
  that surfaces infrastructure noise is a failure regardless of length.
- **Domain vocabulary (`icontains-any`):** each question's answer must touch
  its stable vocabulary — e.g. an earning question that never mentions
  earn/ASK/token/data/share has drifted off-topic. Keywords were derived
  from observed vocabulary across real captured responses, not assumptions.

**Fails when worse, holds when different:** a reworded healthy answer passes
all three; an empty reply, a leaked error, or an off-topic essay fails at
least one.

**Chosen trade-off:** deterministic-only means zero external dependencies and
full reproducibility with no API key. The natural next layer is an
LLM-rubric semantic judge scoring on-topic-ness and helpfulness; the
capture → assert pipeline is already shaped for it.
