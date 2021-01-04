export function datetime(suffix?: string, base?: Date): string {
  const dt = base || new Date();

  return `${date(dt)} ${time(dt)}${suffix || ""}`;
}

export function date(base?: Date): string {
  const date = base || new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
}

export function time(base?: Date): string {
  const date = base || new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${hour < 10 ? "0" : ""}${hour}:${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
}

export async function delay(delayMs: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delayMs);
  });
}
