import path from 'path';
import { app, BrowserWindow, Menu, shell, globalShortcut } from 'electron';

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 200,
        minWidth: 300,
        minHeight: 200,
        frame: false,
        icon: path.join(__dirname, '../static/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    if (process.env['ELECTRON_DEV'] === 'TRUE') {
        win.loadURL('http://localhost:3000');
    }
    else {
        const file = path.join(__dirname, '../static/index.html');
        win.loadFile(file);
    }
    Menu.setApplicationMenu(null);

    globalShortcut.register('F5', () => {
        win.reload();
    });
    globalShortcut.register('F12', () => {
        win.webContents.toggleDevTools();
    });

    globalShortcut.register('Control+E', () => {
        if (win.isVisible()) {
            win.hide();
        }
        else {
            win.show();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

