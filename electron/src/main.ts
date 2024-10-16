import path from 'node:path';
import { app, BrowserWindow, Menu, shell, globalShortcut, Tray, clipboard } from 'electron';
import { ipcping, initIPC } from './ipc';
import { baseDirectoryPath } from './storagepath';
import Wordbook from './wordbook';
import { WordReference } from './services/dict';

const dbPath = path.join(baseDirectoryPath, 'word.db');
const wordbookDB = new Wordbook(dbPath);
const wordReference = new WordReference();

const entrypoint = path.join(__dirname, '../static/index.html');
const faviconPath = path.join(__dirname, '../static/favicon.ico');

initIPC({
    wordbook: wordbookDB,
    wordReference: wordReference,
});

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 200,
        minWidth: 400,
        minHeight: 200,
        frame: false,
        alwaysOnTop: true,
        maximizable: false,
        
        icon: faviconPath,
        webPreferences: {
            preload: path.join(__dirname, './preload/preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    });

    if (process.env['ELECTRON_DEV'] === 'TRUE') {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools({ mode: "detach" });

        globalShortcut.register('F11', () => {
            console.log('F11 is pressed');
            win.webContents.toggleDevTools();
        });
    }
    else {
        win.loadURL(`file://${entrypoint}`);
    }
    Menu.setApplicationMenu(null);

    globalShortcut.register('Control+E', () => {
        if (win.isVisible()) {
            win.hide();
            win.webContents.send(ipcping.ON_HIDE);
        }
        else {
            win.show();
            win.webContents.send(ipcping.ON_VISIBLE);
        }
    });

    globalShortcut.register('Control+Shift+E', () => {
        const clipboardText = clipboard.readText();
        win.webContents.send(ipcping.ON_RECEIVE_CLIPBOARD, clipboardText, !win.isVisible());

        if (!win.isVisible()) {
            win.show();
            win.webContents.send(ipcping.ON_VISIBLE);
        }
    });

    createTrayIcon(win);
}

function createTrayIcon(win:BrowserWindow) {
    const tray = new Tray(faviconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: () => {
                app.quit();
            }
        }
    ]);
    tray.on('double-click', () => {
        if (!win.isVisible()) {
            win.show();
            win.webContents.send(ipcping.ON_VISIBLE);
        }
    });

    tray.setContextMenu(contextMenu);
    tray.setToolTip('Wordbook');
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});