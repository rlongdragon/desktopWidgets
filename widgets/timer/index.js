const { BrowserWindow, ipcMain } = require('electron')
const path = require("path")

ipcMain.on('get-timer-config', (event, arg) => {
  const config = require('./config.json')
  event.reply('get-timer-config-replay', config)
})

ipcMain.on('logger', (event, arg) => {
  switch (arg.type) {
    case 'log':
      console.log(arg.message);
      break;
    case 'error':
      console.error(arg.message);
      break;
  }
});

function startTimer() {
  const config = require("./config.json")
  const win = new BrowserWindow({
    x: config.position.x,
    y: config.position.y,
    // 沒有邊框
    frame: false,
    // 透明背景
    transparent: true,
    // 不顯示在任務欄
    skipTaskbar: true,
    // 視窗不能被最小化
    minimizable: false,
    // 視窗不能被最大化
    maximizable: false,
    // 視窗不能全螢幕
    fullscreenable: false,
    // 視窗不能被關閉
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // 否则页面无法用require
    },
    // 至頂視窗
    alwaysOnTop: true,


    // 窗口可移动
    movable: true,
    // 窗口可调整大小
    resizable: true,
    // 窗口不能聚焦
    focusable: false,

  });

  // win.loadFile('./widgets/timer/pages/timer.html')
  win.loadFile(path.resolve(__dirname, './pages/timer.html'))
  // 忽略滑鼠事件
  win.setIgnoreMouseEvents(true, { forward: true });

  // 處理點擊穿透
  ipcMain.on('win-penetrate-true', (event, arg) => {
    BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(true, { forward: true });
  });
  ipcMain.on('win-penetrate-false', (event, arg) => {
    BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(false);
  });

  ipcMain.on('reset-window-size', (event, arg) => {
    win.setSize(arg.width, arg.height);
  });

  ipcMain.on('stop-timer', (event, arg) => {
    win.close()
  })

  ipcMain.on('timer:stop-widget', (event, arg) => {
    win.close()
  })
}

function settingWidow() {
  const win = new BrowserWindow({
    width: 500,
    height: 600,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // 否则页面无法用require
    },

    // 視窗不能被最大化
    maximizable: false,
    // 視窗不能全螢幕
    fullscreenable: false,
    // 窗口可移动
    movable: true,

    autoHideMenuBar: true,
  });

  win.loadFile('./widgets/timer/pages/index.html')

}


module.exports = {
  'startup': () => {
    const widget = startTimer()

    

    return widget
  },
}