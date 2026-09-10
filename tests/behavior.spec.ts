import { test, expect } from '@playwright/test';
import {
    BASE_URL, agentMessages, dismissCookieBanner, waitForTopicPills, triggerAndAwaitReply,
} from './helpers';

test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await dismissCookieBanner(page);
});

test('send button stays disabled for empty and whitespace-only input', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    const send = page.getByTestId('agent-chat-input-send-button');

    // Empty on load
    await expect(send).toBeDisabled();

    // Whitespace only — should still be un-sendable
    await input.fill('   ');
    await expect(send).toBeDisabled();

    // Real text enables it; clearing disables it again
    await input.fill('hello');
    await expect(send).toBeEnabled();
    await input.fill('');
    await expect(send).toBeDisabled();
});

test('input is cleared and re-usable after a message is sent', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    const send = page.getByTestId('agent-chat-input-send-button');

    await input.fill('What is ASK?');
    await triggerAndAwaitReply(page, () => send.click());

    // After the reply completes, the box is empty and ready for the next question
    await expect(input).toHaveValue('');
    await expect(input).toBeEditable();
});

test('multi-turn: a follow-up question gets a reply and history is preserved', async ({ page }) => {
    const input = page.getByTestId('agent-chat-input');
    const send = page.getByTestId('agent-chat-input-send-button');

    await input.fill('What is Permission?');
    await triggerAndAwaitReply(page, () => send.click());
    const repliesAfterFirst = await agentMessages(page).count();

    await input.fill('How do I earn more?');
    const secondReply = await triggerAndAwaitReply(page, () => send.click());

    expect(secondReply.length).toBeGreaterThan(20);
    expect(await agentMessages(page).count()).toBeGreaterThan(repliesAfterFirst);
    // First user question still visible — conversation history preserved
    await expect(page.getByText('What is Permission?').first()).toBeVisible();
});

test('mobile viewport (375px): pills and input remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await dismissCookieBanner(page);

    await waitForTopicPills(page);
    await expect(page.getByRole('button', { name: 'What is Permission' })).toBeVisible();

    const input = page.getByTestId('agent-chat-input');
    await expect(input).toBeVisible();
    await input.fill('mobile check');
    await expect(page.getByTestId('agent-chat-input-send-button')).toBeEnabled();
});