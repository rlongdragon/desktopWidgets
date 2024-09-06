const { ipcRenderer } = require('electron')


let widgetNames = null

function widgetSetting(widgetNames) {
  console.log(`create ${widgetNames} setting panel`);
  let settingPanel = document.createElement('div');
  settingPanel.className = 'settingPanel';
  settingPanel.setAttribute('widget', widgetNames);

  settingPanel.appendChild((() => {
    let element = document.createElement('h1');
    element.innerText = widgetNames;
    return element;
  })());

  settingPanel.appendChild((() => {
    let element = document.createElement('button');
    element.innerText = '啟動';
    element.setAttribute('status', 'off');
    element.addEventListener('click', () => {
      if(element.getAttribute('status') == 'off') {
        element.innerText='關閉';
        element.setAttribute('status', 'on')
        ipcRenderer.send('menu:start-widget', widgetNames);
      } else {
        element.innerText = '啟動';
        element.setAttribute('status', 'off');
        ipcRenderer.send(`${widgetNames}:stop-widget`);
      }
    });
    return element
  })())

  document.getElementById('settingPanel').appendChild(settingPanel)
}

window.onload = () => {
  // console.log("test")

  ipcRenderer.send('menu:window-onload')
  ipcRenderer.on('menu:window-onload-replay', (event, arg) => {
    console.log(arg)
    widgetNames = arg

    let lsElement = document.createElement('ls')
    for (let i of arg) {
      let element = document.createElement('li')
      element.innerText = i

      widgetSetting(i)

      lsElement.appendChild(element)
    }

    document.getElementById('widgetsList').appendChild(lsElement)
  })
}