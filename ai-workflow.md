# AI Workflow

I used Claude as a pair engineer: it drafted code and documents; I reviewed,
ran, and corrected everything against the real application. AI did the
typing, I did the judgment.

## How

- **Recon:** I inspected the live DOM in devtools and relayed HTML; locator
  strategy was decided together — testids where the app provides them,
  role+text for pills.
- **Code and documents:** AI-drafted, then run, debugged, and edited by me
  against the live site.

## What the AI got wrong (and I caught)

1. `grepInvert` in the Playwright config blocked the explicit
   `--grep @capture` run (filters AND together). Replaced with an env-flag
   skip in the capture spec.
2. Provider path `file://eval/...` — promptfoo resolves relative to the
   config file, not the repo root; the doubled `eval/eval/` in the error
   made it obvious.
3. Current promptfoo instantiates custom providers with `new`; the AI wrote
   an object literal. Rewrote as a class.
4. `not-empty` isn't a promptfoo assertion type; folded emptiness and
   error-leak checks into `javascript` assertions.
5. Captured reply text included the UI timestamp; capture now strips it so
   assertions act on the reply itself.

## Judgment that stayed human

Test selection, the two-layer wait, separating capture from the suite,
worker limits against a live LLM, and every UX finding came from running
and observing the product. Next iteration: Playwright MCP for direct DOM
inspection — faster recon, same human review gate.
