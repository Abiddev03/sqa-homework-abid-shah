import { Page, Locator } from '@playwright/test';

export const BASE_URL = 'https://ask.permission.ai';
const ASK_API = '/api/agent/ask-unauthenticated';

/** Agent messages render left-aligned; user messages right-aligned. */
export const agentMessages = (page: Page): Locator =>
    page.locator('div.justify-start').filter({ has: page.locator('p') });

/** Dismiss the OneTrust cookie banner if it appears (fresh sessions only). */
export async function dismissCookieBanner(page: Page): Promise<void> {
    const accept = page
        .locator('#onetrust-accept-btn-handler')
        .or(page.getByRole('button', { name: /accept all/i }));
    try {
        await accept.first().click({ timeout: 5000 });
    } catch {
        /* banner not shown — continue */
    }
}

export async function waitForTopicPills(page: Page): Promise<void> {
    const pill = page.getByRole('button', { name: 'What is Permission' });
    try {
        await pill.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
        await page.reload();
        await dismissCookieBanner(page);
        await pill.waitFor({ state: 'visible', timeout: 15000 });
    }
}

export async function triggerAndAwaitReply(
    page: Page,
    trigger: () => Promise<void>,
    { stableMs = 1500, timeoutMs = 45000 }: { stableMs?: number; timeoutMs?: number } = {},
): Promise<string> {
    const before = await agentMessages(page).count();

    const apiDone = page.waitForResponse(
        (r) => r.url().includes(ASK_API),
        { timeout: timeoutMs },
    );
    await trigger();
    const response = await apiDone;
    if (!response.ok()) {
        throw new Error(
            `Ask API returned ${response.status()} — live-service failure, not a UI defect`,
        );
    }

    const bubble = agentMessages(page).nth(before); // first new agent bubble
    await bubble.waitFor({ state: 'visible', timeout: 10000 });

    const start = Date.now();
    let last = '';
    let stableSince = Date.now();
    while (Date.now() - start < timeoutMs) {
        const text = ((await bubble.textContent()) ?? '').trim();
        if (text !== last) {
            last = text;
            stableSince = Date.now();
        } else if (text.length > 0 && Date.now() - stableSince >= stableMs) {
            return text;
        }
        await page.waitForTimeout(250);
    }
    throw new Error(`Agent reply did not stabilize within ${timeoutMs}ms`);
}