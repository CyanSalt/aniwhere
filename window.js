const electron = require('electron')
const {
  app, BrowserWindow, Menu, Tray,
  globalShortcut, ipcMain,
} = electron

let frame = null
let tray = null

function init() {
  tray = new Tray(`${__dirname}/src/assets/images/icon.png`)
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
    if (!frame) {
      return
    }
    if (frame.isVisible()) {
      frame.hide()
    } else {
      frame.show()
    }
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
  return Menu.buildFromTemplate([
    {
      label: 'Toggle',
      click() {
        toggleFrame()
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
