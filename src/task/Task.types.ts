export enum TaskType {
  Repeat = "REPEAT",
}

export interface TaskOptions {
  invokeCount: number;
  nextInvokeDelay: number;
  nextErrorDelay?: number;
}