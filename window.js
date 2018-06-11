const electron = require('electron')
const {
  app, BrowserWindow, Menu, Tray,
  globalShortcut, ipcMain, nativeImage,
} = electron

let frame = null
let tray = null

function init() {
  let icon = `${__dirname}/src/assets/images/icon.png`
  if (process.platform === 'darwin') {
    icon = nativeImage.createFromPath(icon).resize({width: 18, height: 18})
  }
  tray = new Tray(icon)
  tray.setContextMenu(createVisibleMenu())
  tray.setToolTip('Aniwhere')
  tray.on('double-click', () => {
    toggleFrame()
  })

  const args = process.argv.slice(1)
  const hide = args.indexOf('--hide') !== -1
  const {workAreaSize} = electron.screen.getPrimaryDisplay()
  frame = new BrowserWindow({
    title: 'Aniwhere',
    width: 600,
    height: 66,
    x: Math.round((workAreaSize.width / 2) - 300),
    y: Math.round(workAreaSize.height * 0.2),
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    show: !hide,
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegrationInWorker: true,
    },
  })
  frame.loadURL(`file://${__dirname}/src/index.html`)
  frame.on('closed', () => {
    frame = null
  })
  frame.setMenu(createInvisibleMenu())
  frame.setMenuBarVisibility(false)

  globalShortcut.register('Alt+Shift+F', () => {
    toggleFrame()
  })
  transferEvents()
}

function createInvisibleMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Hide',
      accelerator: 'Escape',
      click() {
        frame && frame.hide()
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: 'CommandOrControl+Shift+I',
      click() {
        frame && frame.webContents.openDevTools({
          mode: 'undocked'
        })
      }
    },
  ])
}

function createVisibleMenu() {
  const loginOptions = {args: ['--hide']}
  return Menu.buildFromTemplate([
    {
      label: 'Toggle',
      // For display only
      accelerator: 'Alt+Shift+F',
      click() {
        toggleFrame()
      }
    },
    {
      label: 'Launch at login',
      type: 'checkbox',
      checked: app.getLoginItemSettings(loginOptions).openAtLogin,
      click() {
        const {openAtLogin} = app.getLoginItemSettings(loginOptions)
        app.setLoginItemSettings(Object.assign({
          openAtLogin: !openAtLogin,
        }, loginOptions))
      }
    },
    {
      label: 'Quit',
      click() {
        app.quit()
      }
    },
  ])
}

function transferEvents() {
  ipcMain.on('resize/height', (e, height) => {
    const [width, originalHeight] = frame.getSize()
    if (height !== originalHeight) {
      frame && frame.setSize(width, height)
    }
  })
}

function toggleFrame() {
  if (!frame) {
    return
  }
  if (frame.isVisible()) {
    frame.hide()
  } else {
    frame.show()
  }
}

const second = app.makeSingleInstance((argv, directory) => {
  if (frame && !frame.isVisible()) {
    frame.show()
  }
  return true
})

if (second) {
  app.quit()
}

app.on('ready', init)

app.on('activate', () => {
  if (frame === null) {
    init()
  }
})
