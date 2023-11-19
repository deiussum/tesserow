// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/th reaprocess-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dialogs', {
  save: async (data: any): Promise<any> => { return await ipcRenderer.invoke('save', data); },
  open: async (): Promise<any> => { return await ipcRenderer.invoke('open'); },
  import: async (): Promise<any> => { return await ipcRenderer.invoke('import'); },
  export: async (data: any): Promise<any> => { return await ipcRenderer.invoke('export', data); }
});
