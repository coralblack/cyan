import { NextFunction } from "express";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "./Http";
import { Request as HttpRequest } from "../http/Http.request";
import { Status as HttpStatus } from "../http/Http.status";

export type HandlerFunction = (req: CyanRequest, res: CyanResponse, next: NextFunction) => void;
export type ErrorHandlerFunction = (err: Error, req: CyanRequest, res: CyanResponse, next: NextFunction) => void;

export interface CyanRequest {
  headers: HttpHeaders;
  query: HttpQueries;
  params: HttpParams;
  body: any;
  //
  httpRequestContext: HttpRequest;
}

export interface CyanResponse {
  status(code: HttpStatus): this;
  set(field: any): this;
  set(field: string, value?: string | string[]): this;
  header(field: any): this;
  header(field: string, value?: string | string[]): this;
  send(body?: any): this;
  end(): this;
  //
  preparedResponse: any;
  finalized: boolean;
}