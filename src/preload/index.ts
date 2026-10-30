import { contextBridge, ipcRenderer } from 'electron';
import {
  HOST_CHANNEL,
  validateInformation,
  type HostBridge,
} from '../shared/bridge.js';
const bridge: HostBridge = Object.freeze({
  async readHostInformation() {
    const result: unknown = await ipcRenderer.invoke(HOST_CHANNEL);
    return validateInformation(result);
  },
});
contextBridge.exposeInMainWorld('harflowHost', bridge);
