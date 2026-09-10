# Data Checks

Inferred storage behind the product: users, sessions, chat messages,
an interest-category taxonomy with user selections, and an ASK wallet
ledger. Checks I would run with database access, ordered by what the UI
already suggests is worth checking.

## 1. Near-duplicate interest categories (suggested by the UI)

The signed-in interest picker shows both "Travel" and "Travel and Tourism",
and both "Fashion" and "Style & Fashion" — the taxonomy likely contains
near-duplicates, which fragments personalization data.

```sql
SELECT LOWER(TRIM(name)) AS normalized, COUNT(*) AS variants,
       STRING_AGG(name, ' | ') AS names
FROM interest_categories
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;
-- plus a fuzzy pass (e.g. similarity(name, name) or manual review of
-- categories sharing a leading word) for "Travel" vs "Travel and Tourism"
```

## 2. Wallet integrity: balance equals the ledger

Signup awards +100 ASK; balances must always equal the sum of transactions.

```sql
SELECT u.id, w.balance, COALESCE(SUM(t.amount), 0) AS ledger_total
FROM users u
JOIN wallets w ON w.user_id = u.id
LEFT JOIN transactions t ON t.wallet_id = w.id
GROUP BY u.id, w.balance
HAVING w.balance <> COALESCE(SUM(t.amount), 0);
```

## 3. Conversation integrity

```sql
-- messages without a valid session (orphans)
SELECT m.id FROM messages m
LEFT JOIN sessions s ON s.id = m.session_id
WHERE s.id IS NULL;

-- replies that precede their question (clock/ordering bugs)
SELECT session_id FROM messages
WHERE role = 'agent' AND created_at < (
  SELECT MIN(created_at) FROM messages m2
  WHERE m2.session_id = messages.session_id AND m2.role = 'user');
```

## 4. Unanswered questions (agent reliability)

User messages with no agent reply within a threshold — the data-side twin
of the UI suite's "every trigger produces a reply" assertion.
