const audio = new Audio(chrome.runtime.getURL("assets/alert.wav"));
audio.loop = true;
audio.volume = 1;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.target !== 'offscreen') return;
    if (msg.action === "playAlert") {
        // chrome.storage.local.set({ alertActive: true });
        audio.currentTime = 0;
        audio.play();
    }
    if (msg.action === "stopAlert") {
        // chrome.storage.local.set({ alertActive: false });
        audio.pause();
        audio.currentTime = 0;
    }
});