# AI Workflow

I used Claude as a pair engineer throughout: it drafted code and documents,
I reviewed, ran, and corrected everything against the real application.
The division was consistent — AI did the typing, I did the judgment.

## How it was used

- **Recon:** I inspected the live DOM manually (devtools) and relayed HTML
  to the assistant, which derived locators from it. Locator strategy was
  decided together: testids where the app provides them, role+text for pills.
- **Code:** helpers, specs, the capture script, and the promptfoo config were
  AI-drafted, then run and debugged by me against the live site.
- **Documents:** drafted with AI from my raw notes and findings, edited by me.

## What the AI got wrong (and I caught)

1. **`grepInvert` in the Playwright config** blocked the explicit
   `--grep @capture` run entirely (filters AND together). Replaced with an
   env-flag skip in the capture spec — cleaner separation anyway.
2. **Provider path `file://eval/...`** — promptfoo resolves paths relative to
   the config file, not the repo root. The doubled `eval/eval/` in the error
   made it obvious.
3. **Provider shape:** current promptfoo instantiates custom providers with
   `new`; the AI wrote an object literal. Rewrote as a class.
4. **`not-empty` assertion type doesn't exist** in promptfoo; folded emptiness
   and error-leak checks into `javascript` assertions instead.
5. **Captured reply text included the UI timestamp** ("...tokens?01:26 PM").
   Assertions must act on the reply itself, so capture strips it.

## Judgment that stayed human

Which eight tests to write, the two-layer waiting strategy, separating
capture from the pass/fail suite, worker limits against a live LLM, and
every finding in the UX review came from running and observing the product —
the AI accelerated the typing, not the decisions.

Next iteration: Playwright MCP would let the assistant inspect the live DOM
directly instead of manual HTML relay — faster recon, same human review gate.
