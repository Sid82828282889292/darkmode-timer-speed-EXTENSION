chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TIMER") {
    const { tabId, duration } = message;

    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          alert("⏰ Your time is up!");

          const audio = new Audio(chrome.runtime.getURL("icons/alarm.mp3"));
          audio.play();
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
