chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TIMER") {
    const duration = message.duration;
    console.log("[TIMER] Starting timer for", duration, "ms");

    chrome.alarms.clear("tab_timer", () => {
      chrome.alarms.create("tab_timer", {
        when: Date.now() + duration
      });
      console.log("[TIMER] Alarm set to fire in", duration / 1000, "seconds");
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "tab_timer") {
    console.log("[TIMER] Alarm triggered");

    // Show Notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon.png",
      title: "Timer Alert",
      message: "⏰ Your timer is up!"
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("[NOTIFICATION ERROR]", chrome.runtime.lastError.message);
      } else {
        console.log("[NOTIFICATION] Timer alert shown");
      }
    });

    // Open a tab to play sound (bypasses autoplay restrictions)
    chrome.tabs.create({
      url: chrome.runtime.getURL("alarm.html")
    });
  }
});
