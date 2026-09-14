const { app, BrowserWindow, ipcMain } = require('electron');
const { Launcher, CrackAuth } = require('eml-lib');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
    return win;
}

app.whenReady().then(() => {
    const mainwindow = createWindow();

    // Слухаємо команду на запуск гри, отримуємо нікнейм та обрану версію
    ipcMain.on('launch-game', async (event, username, version) => {
        const auth = new CrackAuth();
        const account = auth.auth(username);

        const launcher = new Launcher({
            root: path.join(app.getPath('userData'), 'game'),
            account: account,
            minecraft: {
                version: version // Тепер сюди автоматично підставляється обрана версія з меню!
            }
        });

        launcher.on('launch_download', (d) => mainwindow.webContents.send('log', 'Завантаження файлів...'));
        launcher.on('launch_launch', () => mainwindow.webContents.send('log', 'Запуск Майнкрафт...'));
        launcher.on('launch_close', () => app.quit());

        try {
            await launcher.launch();
        } catch (err) {
            mainwindow.webContents.send('log', 'Помилка: ' + err.message);
        }
    });
});
