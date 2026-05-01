async function ensureOffscreen() {
    const existing = await chrome.offscreen.hasDocument();
    if (!existing) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Play alert sounds for follow-up reminders'
        });
    }
}

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.action === "playAlert" || msg.action === "stopAlert") {
        await ensureOffscreen();
        // Forward message to offscreen document
        chrome.runtime.sendMessage({ ...msg, target: 'offscreen' });
    }
});

