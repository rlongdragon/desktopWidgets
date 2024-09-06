const path = require('path');
const builder = require('electron-builder');

builder.build({

  projectDir: path.resolve(__dirname),  // 專案路徑 

  win: ['nsis', 'portable'],  // nsis . portable
  config: {
    "appId": "rlongClock",
    "productName": "超炫炮螢幕小時鐘", // 應用程式名稱 ( 顯示在應用程式與功能 )
    "directories": {
      "output": "build/win"
    },
    "win": {
      "icon": path.resolve(__dirname, 'c:/Users/User/Downloads/timer icon.png'),
    }
  },
})
  .then(
    data => console.log(data),
    err => console.error(err)
  );