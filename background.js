chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "START_TIMER") {
    const tabId = message.tabId;
    const duration = message.duration;

    chrome.storage.local.set({ timerTabId: tabId });

    chrome.alarms.create("tab_timer", {
      delayInMinutes: duration / 60000
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "tab_timer") {
    chrome.storage.local.get("timerTabId", ({ timerTabId }) => {
      if (timerTabId) {
        chrome.scripting.executeScript({
          target: { tabId: timerTabId },
          func: () => {
            alert("⏰ Time's up!");
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
      }
    });
  }
});
