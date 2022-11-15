const { BrowserWindow, app } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        center: true,
        resizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true
        }
    });
    mainWindow.webContents.loadFile('./app/index.html');
    mainWindow.webContents.openDevTools();
});