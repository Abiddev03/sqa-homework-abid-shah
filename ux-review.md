# UX Review — ask.permission.ai

Scope: unauthenticated chat, signup through profile completion, the
authenticated dashboard (Agent, Data Enrichment Hub, Redeem), and a 375px
mobile pass.

## What works well

- Password requirements update live with green checks — clear, low-friction.
- Profile completion is rewarded (+100 ASK) with the incentive shown on the
  button itself.
- The earning entry point is clear: the Hub surfaces a survey with its ASK
  value up front. Mobile layout holds up — cards stack cleanly and the agent
  opens as a bottom sheet.

## Issues, highest impact first

1. **Signed-in users cannot type in the ASK input while the onboarding
   interest widget is pending.** The input renders normally with a cursor,
   but typing produces nothing until the selection is completed — nothing
   communicates the lock, so a new user's first attempt to talk to the agent
   silently fails. _Repro: fresh account → click ASK input → type → no text.
   Complete the widget → typing works._

2. **The Redeem page shows only expired offers.** Every card reads "Ended
   on…" — there is nothing to redeem. A new user with their first 100 ASK
   finds only rewards they can never claim. Rewards also start at 20,000 ASK
   while a survey pays 25 — the first attainable goal is ~800 surveys away.

3. **Suggested-topic pills render inconsistently on first load**
   (unauthenticated): absent on some fresh sessions and in incognito,
   appearing after refresh — the product's primary call-to-action can simply
   be missing.

4. **Interest taxonomy contains near-duplicates:** "Travel" and "Travel and
   Tourism"; "Fashion" and "Style & Fashion" — users split across variants,
   fragmenting personalization data (see `data-checks.md` §1).

5. **Custom fonts fail site-wide.** The Google Fonts URL is malformed
   (Archivo isn't passed as a `family` parameter) → CORS block + 400; users
   silently get fallback fonts. WalletConnect telemetry also 403s repeatedly.

6. **Referral link is displayed as `http://`** — an insecure-scheme link to
   share, from a product selling data ownership and trust.

7. **Email validation fires prematurely on signup** — red error state before
   the user finishes typing.

8. **Phone code defaults to +1** regardless of locale; verification offers
   Resend but no "change email"; mobile footer text overlaps the cookie icon.

## Testing scope

Authenticated and unauthenticated landings differ (pills appear only
signed-out). The suite targets the unauthenticated experience; finding #1 is
the first candidate for an authenticated pack.
