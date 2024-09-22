import path from 'path';
import { app, BrowserWindow, Menu, shell, globalShortcut } from 'electron';
import { initIPC } from './ipcHandle'

initIPC();

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 200,
        minWidth: 300,
        minHeight: 200,
        frame: false,
        alwaysOnTop: true,
        
        icon: path.join(__dirname, '../build/favicon.ico'),
        webPreferences: {
            preload: path.join(__dirname, './preload/preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    if (process.env['ELECTRON_DEV'] === 'TRUE') {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools({ mode: "detach" });
    }
    else {
        const file = path.join(__dirname, '../build/index.html');
        win.loadURL(`file://${file}`);
    }
    Menu.setApplicationMenu(null);

    globalShortcut.register('F5', () => {
        console.log('F5 is pressed');
        win.reload();
    });
    globalShortcut.register('F11', () => {
        console.log('F11 is pressed');
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