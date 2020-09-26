import { Controller as HttpController } from "..//http/Http.controller";
export declare type Headers = {
    [key: string]: string | number;
};
export declare type Controller = new (...args: any[]) => HttpController;
