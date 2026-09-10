// Serves captured agent replies (from the Playwright @capture run) to
// promptfoo, so evaluation asserts on real production responses without
// re-hitting the live service on every eval run.
//
// Exported as a class: recent promptfoo versions instantiate custom
// file:// providers with `new`.
const fs = require('fs');
const path = require('path');

class CapturedResponsesProvider {
    constructor() {
        this.responses = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'responses.json'), 'utf-8'),
        );
    }

    id() {
        return 'captured-responses';
    }

    async callApi(prompt) {
        const match = this.responses.find((r) => r.question === prompt);
        if (!match) {
            return { error: `No captured response found for question: ${prompt}` };
        }
        return { output: match.answer };
    }
}

module.exports = CapturedResponsesProvider;