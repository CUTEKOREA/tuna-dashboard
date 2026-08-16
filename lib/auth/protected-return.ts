export type ProtectedReturnPath = '/mail' | '/fleet';

export function resolveProtectedReturnPath(value: string | string[] | undefined): ProtectedReturnPath {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === '/fleet' || candidate === '/mail' ? candidate : '/mail';
}
