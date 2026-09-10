# UX Review — ask.permission.ai

Scope: unauthenticated chat, signup → verification → profile completion, and
the authenticated dashboard. Desktop (Chrome) and 375px mobile viewport.

## What works well

- Password requirements update live with green checks — clear, low-friction.
- Profile completion is rewarded (+100 ASK) with the incentive shown on the
  button itself — good activation pattern.
- Onboarding continues inside the chat (interests → extension pitch), which
  fits the agent-first product framing.

## Issues, highest impact first

1. **Signed-in users cannot type in the ASK input while the interest widget
   is pending.** The input renders normally and shows a cursor, but typing
   produces nothing until the interest selection is completed — after
   Continue, typing works. Nothing communicates the lock, so a new user's
   first attempt to talk to the agent silently fails.
   _Repro: fresh account → dashboard shows interest widget → click ASK input
   → type → no text. Complete the widget → typing works._

2. **Suggested-topic pills render inconsistently on first load**
   (unauthenticated). Absent on some fresh sessions and in incognito,
   appearing after a refresh — the product's first impression and primary
   call-to-action can simply be missing.
   _Repro: fresh incognito visit → pills often absent → reload → present._

3. **Interest taxonomy contains near-duplicates:** both "Travel" and
   "Travel and Tourism", both "Fashion" and "Style & Fashion" appear as
   separate options. Users split across variants, fragmenting the very
   personalization data the product runs on (see `data-checks.md` §1).

4. **Referral link is displayed as `http://`, not `https://`** ("Your
   referral link" panel). For a product whose promise is data ownership and
   trust, telling users to share an insecure-scheme link undermines the
   message.

5. **Email validation fires prematurely on signup** — the field shows a red
   error state before the user has finished (or started) typing, reading as
   "you did something wrong" on first contact.

6. **Phone country code defaults to +1** on profile completion regardless of
   locale; the country selector correctly offers Pakistan. Easy locale-based
   default.

7. **Verification screen offers Resend but no "change email"** — a user who
   typo'd their address waits for an email that never comes.

## Note on testing scope

Authenticated and unauthenticated landings are different products: pills and
the greeting appear only signed-out; signed-in users get onboarding widgets.
The automated suite deliberately targets the unauthenticated experience;
finding #1 is the first candidate for an authenticated test pack.
