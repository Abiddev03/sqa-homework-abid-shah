# UX Review — ask.permission.ai

Scope: unauthenticated chat, signup → verification → profile completion, the
authenticated dashboard (Agent, Data Enrichment Hub, Redeem), and a 375px
mobile pass. Chrome desktop + mobile emulation.

## What works well

- Password requirements update live with green checks — clear, low-friction.
- Profile completion is rewarded (+100 ASK) with the incentive on the button
  itself — good activation pattern.
- The earning entry point is clear: Data Enrichment Hub surfaces a survey
  with its ASK value up front.
- Mobile layout holds up: cards stack cleanly and the agent opens as a
  bottom sheet.

## Issues, highest impact first

1. **Signed-in users cannot type in the ASK input while the onboarding
   interest widget is pending.** The input renders normally and shows a
   cursor, but typing produces nothing until the selection is completed —
   after Continue, typing works. Nothing communicates the lock, so a new
   user's first attempt to talk to the agent silently fails.
   _Repro: fresh account → interest widget shown → click ASK input → type →
   no text. Complete the widget → typing works._

2. **The Redeem page shows only expired offers.** Every card under "Past
   Offers" (Starbucks, Apple, Netflix, Spotify, Google Play) reads
   "Ended on…" — there is no active-offers section. A new user arriving with
   their first 100 ASK finds only rewards they can never claim, undercutting
   the earn-to-redeem loop. Rewards also start at 20,000 ASK while a survey
   pays 25, so the first attainable goal is ~800 surveys away — worth a
   lower-tier reward or clearer progress framing.

3. **Suggested-topic pills render inconsistently on first load**
   (unauthenticated). Absent on some fresh sessions and in incognito,
   appearing after a refresh — the product's first impression and primary
   call-to-action can simply be missing.
   _Repro: fresh incognito visit → pills often absent → reload → present._

4. **Interest taxonomy contains near-duplicates:** both "Travel" and
   "Travel and Tourism", both "Fashion" and "Style & Fashion" appear as
   separate options — users split across variants, fragmenting the very
   personalization data the product runs on (see `data-checks.md` §1).

5. **Custom fonts fail to load site-wide.** The Google Fonts request is
   malformed (`…wght@100;wght@400&Archivo:wght@400;700…` — Archivo is not
   passed as a `family` parameter), producing a CORS block and a 400; every
   user silently gets fallback fonts. The console also shows repeated 403s
   from WalletConnect telemetry (`pulse.walletconnect.org`).

6. **Referral link is displayed as `http://`, not `https://`.** For a
   product whose promise is data ownership and trust, telling users to share
   an insecure-scheme link undermines the message.

7. **Email validation fires prematurely on signup** — the field shows a red
   error state before the user has finished typing, reading as "you did
   something wrong" on first contact.

8. **Phone country code defaults to +1** regardless of locale, while the
   country selector correctly offers Pakistan. Easy locale-based default.

9. **Verification screen offers Resend but no "change email"** — a user who
   typo'd their address waits for an email that never comes. Minor: the
   mobile footer's copyright text overlaps the cookie-settings icon.

## Note on testing scope

Authenticated and unauthenticated landings are different products: pills and
the greeting appear only signed-out; signed-in users get onboarding widgets.
The automated suite deliberately targets the unauthenticated experience;
finding #1 is the first candidate for an authenticated test pack.
