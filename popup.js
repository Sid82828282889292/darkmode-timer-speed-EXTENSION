let chart;
let speedData = [];

document.getElementById("toggle-dark").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleDarkMode,
    args: [document.getElementById("theme").value]
  });
});

function toggleDarkMode(theme = "dracula") {
  const styleId = "dark-theme-style";
  const existing = document.getElementById(styleId);
  if (existing) {
    existing.remove();
    return;
  }

  const themes = {
    dracula: {
      bg: "#282a36",
      fg: "#f8f8f2",
      link: "#bd93f9",
      accent: "#ff79c6"
    },
    nord: {
      bg: "#2e3440",
      fg: "#d8dee9",
      link: "#88c0d0",
      accent: "#bf616a"
    },
    solarized: {
      bg: "#002b36",
      fg: "#839496",
      link: "#268bd2",
      accent: "#b58900"
    }
  };

  const t = themes[theme];

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    html, body {
      background-color: ${t.bg} !important;
      color: ${t.fg} !important;
    }
    * {
      background-color: transparent !important;
      color: ${t.fg} !important;
      border-color: ${t.accent} !important;
    }
    a, a * {
      color: ${t.link} !important;
    }
    img, video {
      filter: brightness(0.9) contrast(1.1);
    }
    input, textarea, select, button {
      background-color: ${t.bg} !important;
      color: ${t.fg} !important;
    }
    ::selection {
      background: ${t.accent};
      color: #fff;
    }
  `;
  document.head.appendChild(style);
}

document.getElementById("start-timer").addEventListener("click", async () => {
  const mins = parseInt(document.getElementById("min").value || "0");
  const secs = parseInt(document.getElementById("sec").value || "0");
  const totalMillis = (mins * 60 + secs) * 1000;

  if (totalMillis === 0) {
    document.getElementById("status").textContent = "⏳ Please set a valid time.";
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.runtime.sendMessage({
    type: "START_TIMER",
    tabId: tab.id,
    duration: totalMillis
  });

  document.getElementById("status").textContent = `⏱ Timer set for ${mins}m ${secs}s`;
});

async function testDownloadSpeed() {
  const imageAddr = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
  const startTime = new Date().getTime();
  try {
    await fetch(imageAddr + "?nn=" + Math.random(), { cache: "no-store" });
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = 200 * 1024 * 8;
    const speedBps = bitsLoaded / duration;
    const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);
    return parseFloat(speedMbps);
  } catch {
    return 0;
  }
}

function updateChart(speed) {
  const now = new Date().toLocaleTimeString();
  speedData.push({ time: now, speed });
  if (speedData.length > 10) speedData.shift();

  chart.data.labels = speedData.map(e => e.time);
  chart.data.datasets[0].data = speedData.map(e => e.speed);
  chart.update();
}

function startSpeedMonitor() {
  chart = new Chart(document.getElementById("speedChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Mbps",
        borderColor: "#00ff99",
        data: [],
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "#ccc" }
        },
        x: {
          ticks: { color: "#ccc" }
        }
      }
    }
  });

  setInterval(async () => {
    const speed = await testDownloadSpeed();
    updateChart(speed);
  }, 5000);
}

startSpeedMonitor();
