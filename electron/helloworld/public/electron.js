const { BrowserWindow, app } = require("electron");

function createWindow() {

    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${__dirname}/index.html`;

    win.loadURL(startUrl);
}

app.on("ready", createWindow);
