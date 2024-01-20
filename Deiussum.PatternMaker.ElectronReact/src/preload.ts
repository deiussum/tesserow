// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/th reaprocess-model#preload-scripts
import ExportOptions from './ExportOptions';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dialogs', {
  getFileName: async (filters: any, save: boolean): Promise<any> => { return await ipcRenderer.invoke('getFileName', filters, save); },
  save: async (data: any): Promise<any> => { return await ipcRenderer.invoke('save', data); },
  open: async (): Promise<any> => { return await ipcRenderer.invoke('open'); },
  import: async (): Promise<any> => { return await ipcRenderer.invoke('import'); },
  resize: async (filePath: string, width: number, height: number): Promise<any> => { return await ipcRenderer.invoke('resize', filePath, width, height); },
  export: async (data: any, options: ExportOptions): Promise<any> => { return await ipcRenderer.invoke('export', data, options); }
});
