import { test, expect } from '@playwright/test';
import {
    BASE_URL, agentMessages, dismissCookieBanner, waitForTopicPills, triggerAndAwaitReply,
} from './helpers';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await dismissCookieBanner(page);
});

test('landing page shows the suggested-topic pills', async ({ page }) => {
    await waitForTopicPills(page);
    for (const topic of [
        'What is Permission', 'Best way to earn ASK', 'How permission uses my data',
        'What is passive earning', 'What is data ownership', 'Permission Wallet',
    ]) {
        await expect(page.getByRole('button', { name: topic })).toBeVisible();
    }
});

test('clicking a suggested topic produces an agent response', async ({ page }) => {
    await waitForTopicPills(page);
    const reply = await triggerAndAwaitReply(page, () =>
        page.getByRole('button', { name: 'What is Permission' }).click(),
    );
    expect(reply.length).toBeGreaterThan(40);
});

test('free-text question via the ASK input produces an agent response', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    const send = page.getByTestId('agent-chat-input-send-button');

    await input.fill('In one sentence, what is Permission?');
    await expect(send).toBeEnabled();

    const reply = await triggerAndAwaitReply(page, () => send.click());
    expect(reply.length).toBeGreaterThan(20);
});

test('Shift+Enter adds a new line instead of sending', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    const repliesBefore = await agentMessages(page).count();

    await input.fill('line one');
    await input.press('Shift+Enter');
    await input.pressSequentially('line two');

    await expect(input).toHaveValue('line one\nline two');
    await page.waitForTimeout(1500);
    expect(await agentMessages(page).count()).toBe(repliesBefore); // nothing sent
});