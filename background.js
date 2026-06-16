// async function ensureOffscreen() {
//     const existing = await chrome.offscreen.hasDocument();
//     if (!existing) {
//         await chrome.offscreen.createDocument({
//             url: 'offscreen.html',
//             reasons: ['AUDIO_PLAYBACK'],
//             justification: 'Play alert sounds for follow-up reminders'
//         });
//     }
// }

// chrome.runtime.onMessage.addListener(async (msg) => {
//     if (msg.action === "playAlert" || msg.action === "stopAlert") {
//         await ensureOffscreen();
//         // Forward message to offscreen document
//         chrome.runtime.sendMessage({ ...msg, target: 'offscreen' });
//     }
// });



// background.js

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "playAlert") {
        // 1. Set global state to active
        chrome.storage.local.set({ alertActive: true });
        playAudioHelper();
    }

    if (message.action === "stopAlert") {
        chrome.storage.local.set({ alertActive: false });
        stopAudioHelper();
    }
});

async function playAudioHelper() {
    if (!(await chrome.offscreen.hasDocument?.())) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Playing looping notification alerts'
        });
    }
    chrome.storage.local.set({ alertActive: true });
    chrome.runtime.sendMessage({ action: "playAlert", target: 'offscreen' });
    // chrome.runtime.sendMessage({ action: "playAlert" });
}

function stopAudioHelper() {
    // 1. Clear global state
    chrome.storage.local.set({ alertActive: false });
    // 2. Tell offscreen document to silence audio
    // chrome.runtime.sendMessage({ action: "stopAlert" });
    chrome.runtime.sendMessage({ action: "stopAlert", target: 'offscreen' });
}   