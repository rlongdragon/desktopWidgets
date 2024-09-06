const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const fs = require("fs");
const path = require("path");

ipcMain.on("logger", (event, arg) => {
  switch (arg.type) {
    case "log":
      console.log(arg.message);
      break;
    case "error":
      console.error(arg.message);
      break;
  }
});

function menuWindow() {
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
  })

  win.loadFile("./menu.html")

  let widgets = {}

  ipcMain.on("menu:window-onload", (event, arg) => {
    const widgetsDir = './widgets';

    // 讀取 widgets 資料夾下的所有項目
    fs.readdir(widgetsDir, (err, files) => {
      if (err) {
        console.error('無法讀取 widgets 資料夾:', err);
        return;
      }

      // 篩選出資料夾
      const widgetFolders = files.filter(file => {
        return fs.statSync(path.join(widgetsDir, file)).isDirectory();
      });

      // 載入每個資料夾的 index.js
      widgetFolders.forEach(folder => {
        try {
          widgets[folder] = require(`./widgets/${folder}/index`);
          console.log(`load widget [${folder}]: SUCCESS!`);
        } catch (error) {
          console.error(`load widget ${folder}:`, error);
        }
      });

      event.reply("menu:window-onload-replay", widgetFolders)
    });
  })

  ipcMain.on("menu:start-widget", (event, arg) => {
    console.log(widgets[arg])
    widgets[arg].startup()
  })

  win.once('close', () => { app.quit() })
}

// function trayIcon(main) {
//   const tray = new Tray('./icon.png');
//   tray.on('click', () => {
//     main.show();
//   });
//   const contextMenu = Menu.buildFromTemplate([
//     {
//       label: '显示窗口',
//       click: () => {
//         // 这里添加显示主窗口的代码
//       }
//     },
//     { type: 'separator' },
//     {
//       label: '退出',
//       click: () => {
//         app.quit();
//       }
//     }
//   ]);

//   tray.setContextMenu(contextMenu);
// }

app.whenReady().then(() => {
  let main = menuWindow()
  // trayIcon(main)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})