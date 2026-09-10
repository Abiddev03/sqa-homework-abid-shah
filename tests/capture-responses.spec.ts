import { test } from '@playwright/test';
import { BASE_URL, dismissCookieBanner, triggerAndAwaitReply } from './helpers';
import * as fs from 'fs';


test.skip(!process.env.CAPTURE, 'Capture runs only when CAPTURE=1 is set');

test('capture agent responses for evaluation @capture', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto(BASE_URL);
    await dismissCookieBanner(page);

    const questions = [
        'What is Permission?',
        'How do I earn ASK tokens?',
        'What is data ownership?',
    ];
    const captured: { question: string; answer: string }[] = [];

    for (const q of questions) {
        const input = page.getByTestId('agent-chat-input');
        await input.fill(q);
        const answer = await triggerAndAwaitReply(page, () =>
            page.getByTestId('agent-chat-input-send-button').click(),
        );
        const clean = answer.replace(/\d{1,2}:\d{2}\s?(AM|PM)\s*$/i, '').trim();
        captured.push({ question: q, answer: clean });
    }

    fs.mkdirSync('eval', { recursive: true });
    fs.writeFileSync('eval/responses.json', JSON.stringify(captured, null, 2));
});