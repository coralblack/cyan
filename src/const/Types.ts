export type ObjectType<T> = { new(): T };
export type ClassType<T> = { new(...args: any[]): T };
