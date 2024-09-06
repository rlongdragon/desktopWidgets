const { ipcRenderer } = require('electron');

let isTimerActive = false
document.getElementById("timer").addEventListener("click", () => {
  console.log(isTimerActive)
  if (!isTimerActive) {
    ipcRenderer.send("start-timer")
    document.getElementById("timer").innerText = "關閉計時器"
  } else {
    ipcRenderer.send("stop-timer")
    document.getElementById("timer").innerText = "開啟計時器"
  }
  isTimerActive = !isTimerActive 
})