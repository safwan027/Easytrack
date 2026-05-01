const audio = new Audio(chrome.runtime.getURL("assets/alert.wav"));
audio.loop = true;
audio.volume = 1;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.target !== 'offscreen') return;
    if (msg.action === "playAlert") {
        audio.currentTime = 0;
        audio.play();
    }
    if (msg.action === "stopAlert") {
        audio.pause();
        audio.currentTime = 0;
    }
});