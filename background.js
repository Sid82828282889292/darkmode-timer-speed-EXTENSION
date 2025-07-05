chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TIMER") {
    const { tabId, duration } = message;

    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          alert("⏰ Your time is up!");
        }
      });

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.png",
        title: "Tab Timer Alert",
        message: "⏳ Your time is up!"
      });
    }, duration);
  }
});
