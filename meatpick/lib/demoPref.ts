// 데모 모드 on/off 기억. localStorage가 막힌 환경에서도 메모리 값으로 동작한다.

const KEY = "meatpick:demo";
const listeners = new Set<() => void>();
let memory: boolean | null = null;

export function getDemoPref(): boolean {
  if (memory !== null) return memory;
  try {
    memory = localStorage.getItem(KEY) !== "0";
  } catch {
    memory = true;
  }
  return memory;
}

export const getDemoPrefServer = () => true;

export function setDemoPref(on: boolean) {
  memory = on;
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l());
}

export function subscribeDemoPref(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
