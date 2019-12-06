const { BrowserWindow, app, Menu } = require('electron')
require('./server/index.js')

let mainWindow = null

function main() {
  mainWindow = new BrowserWindow({width: 1920, height:1080, frame: true, fullscreen: false})
  mainWindow.loadURL(`http://localhost:8080`)
  mainWindow.on('close', event => {
    mainWindow = null
  })
}

app.on('ready', main)
