import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('lushuAPI', {
  savePDF: (filename: string, buffer: ArrayBuffer) =>
    ipcRenderer.invoke('save-pdf', { filename, buffer }),
})
