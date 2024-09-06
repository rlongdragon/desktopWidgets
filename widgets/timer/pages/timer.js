const { ipcRenderer } = require('electron');

// init
ipcRenderer.send("get-timer-config")
ipcRenderer.on("get-timer-config-replay", (event, arg) => {
  document.body.style.setProperty('--scale', arg.scale)
  resetWindowSize(document.body);
})

let mode = "clock" // clock, stopwatch, countdown

// 重置視窗大小
function resetWindowSize(body) {
  width = parseInt((body.getBoundingClientRect()).width) + parseInt(body.style.margin) * 2;
  height = parseInt((body.getBoundingClientRect()).height) + parseInt(body.style.margin) * 2;

  console.log(width, height);
  ipcRenderer.send('reset-window-size', { width, height });
}

resetWindowSize(document.body);

// 获取目标元素
const targetElements = document.getElementsByClassName("action-element") // 替换 'your-element-id' 为你的元素 ID
for (let i = 0; i < targetElements.length; i++) {
  const targetElement = targetElements[i];
  // 监听鼠标进入事件
  targetElement.addEventListener('mouseenter', () => {
    ipcRenderer.send('win-penetrate-false');
  });

  // 监听鼠标离开事件
  targetElement.addEventListener('mouseleave', () => {
    ipcRenderer.send('win-penetrate-true');
  });
}

// 点击穿透开启
// document.addEventListener('click', () => {
//   ipcRenderer.send('win-penetrate-true');
// });

const draggableElement = document.querySelector('.draggable');
let isDragging = false;
let startX, startY;

draggableElement.addEventListener('mousedown', (event) => {
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  // ipcRenderer.send("logger", { type: "log", message: { startX, startY } });
});

draggableElement.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    window.moveBy(deltaX, deltaY); // 使用瀏覽器 API 移動視窗
  }
});

draggableElement.addEventListener('mouseup', () => {
  isDragging = false;
});


document.getElementById("scale").addEventListener("wheel", (e) => {
  // console.log(e.deltaY);
  let body = document.body;
  let scale = parseFloat(body.style.getPropertyValue('--scale')) || 1;

  if (e.deltaY > 0) {
    if (scale > 0.4) {
      body.style.setProperty('--scale', scale - 0.1);
      resetWindowSize(document.body);
    }
  } else {
    if (scale < 2) {
      body.style.setProperty('--scale', scale + 0.1);
      resetWindowSize(document.body);
    }
  }
});


let startTime = 0;
let endTime = 0;

let totalPauseTime = 0;
let startPauseTime = 0;

/**
 * 
 * @param {Date} time 
 */
function timeFormat(time) {
  let hour = time.getHours();
  let minute = time.getMinutes();
  let second = time.getSeconds();
  let millisecond = time.getMilliseconds();
  // return `${hour / 10 >= 1 ? hour : "0" + hour}:${minute / 10 >= 1 ? minute : "0" + minute}:${second / 10 >= 1 ? second : "0" + second}.${millisecond / 100 >= 1 ? millisecond : millisecond / 10 >= 1 ? "0" + millisecond : "00" + millisecond}`;
  return { hour: hour / 10 >= 1 ? hour : "0" + hour, minute: minute / 10 >= 1 ? minute : "0" + minute, second: second / 10 >= 1 ? second : "0" + second, millisecond: millisecond / 100 >= 1 ? millisecond : millisecond / 10 >= 1 ? "0" + millisecond : "00" + millisecond };
}

document.getElementById("mode").addEventListener("click", () => {
  let modes = [["clock"], ["stopwatch", "stopwatch-stop"], ["countdown", "countdown-stop"]];
  mode = ((n) => n[n.length - 1])(modes[((((mode) => { for (let i = 0; i < modes.length; i++) { if (modes[i].includes(mode)) return i } }))(mode) + 1) % modes.length]);
  switch (mode) {
    case "clock":
      time = timeFormat(new Date());
      document.querySelectorAll("#timer > span").forEach((element, index) => {
        element.innerText = time[element.id];
      });
      document.getElementById("countdown").style.display = "none";
      document.getElementById("stopwatch").style.display = "none";
      resetWindowSize(document.body);
      document.getElementById("modeShow").innerText = ":CLOCK";
      break;
    case "stopwatch-stop":
      resetTimer();
      document.getElementById("countdown").style.display = "none";
      document.getElementById("stopwatch").style.display = "block";
      resetWindowSize(document.body);
      document.getElementById("modeShow").innerText = ":STOPWATCH";
      break;
    case "countdown-stop":
      resetTimer();
      document.getElementById("countdown").style.display = "block";
      document.getElementById("stopwatch").style.display = "none";
      resetWindowSize(document.body);
      document.getElementById("modeShow").innerText = ":COUNTDOWN";
      break;
  }
});

// 歸零
function resetTimer() {
  time = { hour: "00", minute: "00", second: "00", millisecond: "000" };
  document.querySelectorAll("#timer > span").forEach((element, index) => {
    element.innerText = time[element.id];
  });
}


// Stopwatch
document.getElementById("stopwatch-start").addEventListener("click", () => {
  if (startTime == 0) {
    mode = "stopwatch";

    startTime = new Date().getTime();
    // ipcRenderer.send("logger", { type: "log", message: startTime });

    totalPauseTime = 0;
    startPauseTime = 0;
  } else if (mode == "stopwatch-stop") {
    mode = "stopwatch";

    totalPauseTime += new Date().getTime() - pauseStartTime;
    // ipcRenderer.send("logger", { type: "log", message: totalPauseTime });
  }
});

document.getElementById("stopwatch-stop").addEventListener("click", () => {
  if (startTime != 0) {
    mode = "stopwatch-stop";
    pauseStartTime = new Date().getTime();
  }
});

document.getElementById("stopwatch-reset").addEventListener("click", () => {
  startTime = 0;
  mode = "stopwatch-stop";
  resetTimer();
});

// Countdown
function addTime(id) {
  if (id == "millisecond") {
    document.getElementById("millisecond").innerText = ((n) => { n = n.toString(); while (n.length < 3) { n = "0" + n } return n })(parseInt(document.getElementById("millisecond").innerText) + 1);
    if (document.getElementById("millisecond").innerText > 999) {
      document.getElementById("millisecond").innerText = "000";
      addTime("second");
    }
  } else {
    document.getElementById(id).innerText = ((n) => { n = n.toString(); while (n.length < 2) { n = "0" + n } return n })(parseInt(document.getElementById(id).innerText) + 1);
    if (document.getElementById(id).innerText > 59) {
      document.getElementById(id).innerText = "00";
      if (id == "second") {
        addTime("minute");
      } else if (id == "minute") {
        addTime("hour");
      }
    }
  }
}

function minusTime(id) {
  if (id == "millisecond") {
    document.getElementById("millisecond").innerText = ((n) => { n = n.toString(); while (n.length < 3) { n = "0" + n } return n })(parseInt(document.getElementById("millisecond").innerText) - 1);
    if (parseInt(document.getElementById("millisecond").innerText) <= 0) {
      if (minusTime("second")) {
        document.getElementById("millisecond").innerText = "999";
      } else {
        document.getElementById("millisecond").innerText = "000"
        return false;
      }
    }
  } else {
    document.getElementById(id).innerText = ((n) => { n = n.toString(); while (n.length < 2) { n = "0" + n } return n })(parseInt(document.getElementById(id).innerText) - 1);
    if (document.getElementById(id).innerText < 0) {
      if (id == "second") {
        if (minusTime("minute")) {
          document.getElementById(id).innerText = "59";
          return true;
        } else {
          document.getElementById(id).innerText = "00";
          return false;
        }
      } else if (id == "minute") {
        if (minusTime("hour")) {
          document.getElementById(id).innerText = "59";
          return true;
        } else {
          document.getElementById(id).innerText = "00";
          return false;
        }
      } else {
        document.getElementById(id).innerText = "00";
        return false;
      }
    } else {
      return true;
    }
  }
}

document.querySelectorAll("#timer > span").forEach((element, index) => {
  element.addEventListener("wheel", (e) => {
    if (!(mode.includes("countdown-stop"))) return;
    if (e.deltaY > 0) {
      minusTime(element.id);
    } else {
      addTime(element.id);
    }
  });

  element.addEventListener('mouseenter', () => {
    if (!(mode.includes("countdown-stop"))) return;
    ipcRenderer.send('win-penetrate-false');
  });

  // 监听鼠标离开事件
  element.addEventListener('mouseleave', () => {
    if (!(mode.includes("countdown-stop"))) return;
    ipcRenderer.send('win-penetrate-true');
  });
});

function getCountdownTime() {
  let time = { hour: parseInt(document.getElementById("hour").innerText), minute: parseInt(document.getElementById("minute").innerText), second: parseInt(document.getElementById("second").innerText), millisecond: parseInt(document.getElementById("millisecond").innerText) };
  return time;
}

document.getElementById("countdown-start").addEventListener("click", () => {
  if (endTime == 0) {
    mode = "countdown";
    time = getCountdownTime();
    endTime = new Date(new Date().getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000 + time.second * 1000 + time.millisecond);
  } else if (mode == "countdown-stop") {
    mode = "countdown";
    time = getCountdownTime();
    endTime = new Date(new Date().getTime() + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000 + time.second * 1000 + time.millisecond);
  }
});

document.getElementById("countdown-stop").addEventListener("click", () => {
  if (endTime != 0) {
    mode = "countdown-stop";
  }
});

document.getElementById("countdown-reset").addEventListener("click", () => {
  endTime = 0;
  mode = "countdown-stop";
  resetTimer();
});


(() => {
  setInterval(() => {
    switch (mode) {
      case "clock":
        time = timeFormat(new Date());
        document.querySelectorAll("#timer > span").forEach((element, index) => {
          element.innerText = time[element.id];
        });
        break;
      case "stopwatch":
        if (startTime == 0) break;
        time = timeFormat(new Date(new Date().getTime() - startTime - totalPauseTime + (new Date().getTimezoneOffset() * 60 * 1000)));
        document.querySelectorAll("#timer > span").forEach((element, index) => {
          element.innerText = time[element.id];
        });
        break;
      case "countdown":
        if (endTime == 0) break;
        time = timeFormat(new Date(endTime - new Date().getTime() + (new Date().getTimezoneOffset() * 60 * 1000)));
        document.querySelectorAll("#timer > span").forEach((element, index) => {
          element.innerText = time[element.id];
        });
        if (new Date().getTime() >= endTime) {
          endTime = 0;
          mode = "countdown-stop";
          resetTimer();
        }
        break;
    }
  }, 10);
})()