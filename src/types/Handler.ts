import { NextFunction } from "express";
import { Headers as HttpHeaders, Params as HttpParams, Queries as HttpQueries } from "./Http";
import { HttpMethod } from "../http";
import { HttpError } from "../http/Http.error";
import { HttpRequest as HttpRequest } from "../http/Http.request";
import { Status as HttpStatus } from "../http/Http.status";

export type HandlerFunction = (req: CyanRequest, res: CyanResponse, next: NextFunction) => void;
export type ErrorHandlerFunction = (err: Error | HttpError, req: CyanRequest, res: CyanResponse, next: NextFunction) => void;

export interface CyanRequest {
  method: HttpMethod;
  url: string;
  headers: HttpHeaders;
  query: HttpQueries;
  params: HttpParams;
  body: any;
  _startTime: Date;
  _remoteAddress: string;
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
