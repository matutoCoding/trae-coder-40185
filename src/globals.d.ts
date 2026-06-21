export {}

declare global {
  interface Window {
    lushuAPI: {
      savePDF: (filename: string, buffer: ArrayBuffer) => Promise<{
        success: boolean
        filePath?: string
      }>
    }
  }
}
