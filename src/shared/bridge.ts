export const HOST_CHANNEL = 'host:information';
export interface HostInformation {
  readonly application: string;
  readonly version: string;
}
export interface HostBridge {
  readHostInformation(): Promise<HostInformation>;
}
export function validateRequest(value: unknown): void {
  if (value !== undefined)
    throw new Error('Unexpected host-information request payload');
}
function validText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}
export function validateInformation(value: unknown): HostInformation {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('application' in value) ||
    !('version' in value) ||
    Object.keys(value).length !== 2
  )
    throw new Error('Invalid host information');
  if (!validText(value.application) || !validText(value.version))
    throw new Error('Invalid host information');
  return Object.freeze({
    application: value.application,
    version: value.version,
  });
}
export function validateSender(
  actualUrl: string,
  expectedUrl: string,
  isMainFrame: boolean,
): void {
  if (!isMainFrame || actualUrl !== expectedUrl)
    throw new Error('Untrusted IPC sender');
}
