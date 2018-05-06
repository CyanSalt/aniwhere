const {
  app, BrowserWindow, Menu, Tray,
  globalShortcut, ipcMain
} = require('electron')

let frame = null
let tray = null

function init() {
  tray = new Tray('./src/assets/images/icon.png')
  tray.setContextMenu(createVisibleMenu())

  frame = new BrowserWindow({
    title: 'Aniwhere',
    width: 600,
    height: 66,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    webPreferences: {
      experimentalFeatures: true,
    },
  })
  frame.loadURL(`file://${__dirname}/src/index.html`)
  frame.on('closed', () => {
    frame = null
  })
  frame.setMenu(createInvisibleMenu())
  frame.setMenuBarVisibility(false)

  globalShortcut.register('Alt+Shift+P', () => {
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
        if (!frame) {
          return
        }
        if (frame.isVisible()) {
          frame.hide()
        } else {
          frame.show()
        }
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
    const [width] = frame.getSize()
    frame && frame.setSize(width, height)
  })
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
