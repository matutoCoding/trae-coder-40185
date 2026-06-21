import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged 
  ? process.env.DIST 
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

function createWindow() {
  const dist = process.env.DIST || ''
  const vitePublic = process.env.VITE_PUBLIC || ''
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    title: '路书制作工具',
    icon: path.join(vitePublic, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(dist, 'index.html'))
  }
}

ipcMain.handle('save-pdf', async (_event, data: { filename: string; buffer: ArrayBuffer }) => {
  const result = await dialog.showSaveDialog({
    title: '保存路书 PDF',
    defaultPath: data.filename,
    filters: [{ name: 'PDF 文件', extensions: ['pdf'] }],
  })

  if (result.canceled || !result.filePath) {
    return { success: false }
  }

  const fs = await import('node:fs/promises')
  await fs.writeFile(result.filePath, Buffer.from(data.buffer))
  return { success: true, filePath: result.filePath }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
