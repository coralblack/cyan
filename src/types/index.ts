export type ClassType<T> = { new(...args: any[]): T };
export type EnumType = {[key: number]: number | string };
export type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];