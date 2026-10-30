import { createRoot } from 'react-dom/client';
import { HostDiagnosticFeature } from '@harflow/ui/features';
import type { HostInformationPort } from '@harflow/ui/application';
import type { HostBridge } from '../shared/bridge.js';
declare global {
  interface Window {
    readonly harflowHost: HostBridge;
  }
}
const host: HostInformationPort = {
  read: () => window.harflowHost.readHostInformation(),
};
const root = document.getElementById('root');
if (!root) throw new Error('Missing renderer root');
createRoot(root).render(<HostDiagnosticFeature host={host} />);
