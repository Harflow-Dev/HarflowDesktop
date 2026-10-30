import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  HOST_CHANNEL,
  validateInformation,
  validateRequest,
  validateSender,
} from '../shared/bridge.js';
const smoke = process.argv.includes('--smoke');
async function launch(): Promise<void> {
  const renderer = pathToFileURL(
    join(app.getAppPath(), 'dist/renderer/index.html'),
  ).href;
  session.defaultSession.setPermissionRequestHandler(
    (_contents, _permission, callback) => {
      callback(false);
    },
  );
  const window = new BrowserWindow({
    show: !smoke,
    webPreferences: {
      preload: join(app.getAppPath(), 'dist/preload/index.cjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== renderer) event.preventDefault();
  });
  window.webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
  ipcMain.handle(HOST_CHANNEL, (event, payload: unknown) => {
    validateSender(
      event.senderFrame?.url ?? '',
      renderer,
      event.sender === window.webContents &&
        event.senderFrame === window.webContents.mainFrame,
    );
    validateRequest(payload);
    return validateInformation({
      application: 'HarflowDesktop scaffold',
      version: app.getVersion(),
    });
  });
  await window.loadURL(renderer);
  if (smoke) {
    const passed: unknown = await window.webContents
      .executeJavaScript(`(async () => {
      const info = await window.harflowHost.readHostInformation();
      for (let attempt = 0; attempt < 100; attempt++) {
        if (document.querySelector('[role="status"]')?.textContent?.includes(info.application)) return true;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      return false;
    })()`);
    if (passed !== true)
      throw new Error('Production renderer/bridge smoke failed');
    console.log('Production renderer and sandbox preload bridge passed');
    app.quit();
  }
}
app
  .whenReady()
  .then(launch)
  .catch((error: unknown) => {
    console.error(error);
    app.exit(1);
  });
app.on('window-all-closed', () => {
  app.quit();
});
if (smoke)
  setTimeout(() => {
    console.error('Production smoke timed out');
    app.exit(1);
  }, 15000).unref();
