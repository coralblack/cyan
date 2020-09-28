import { Method as HttpMethod } from "../http/Http.method";
import { Headers as HttpHeaders, ReqData as HttpReqData, ReqParams as HttpReqParams } from "../types/Http";

/* eslint-disable @typescript-eslint/no-unsafe-return */
let axios: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  axios = require("axios").default;
} catch (e) {
  if (e.message.indexOf("Cannot find module") !== -1) {
    throw Error("Please install the `axios` library to use `HttpHelper` (use `npm install --save axios@0.20`).");
  } else {
    throw e;
  }
}

export type HttpResponseType = "arraybuffer" | "document" | "json" | "text" | "stream";

export interface HttpCommonRequestPayload {
  url: string;
  baseUrl?: string;
  headers?: HttpHeaders;
  timeout?: number;
  responseType?: HttpResponseType;
  debug?: boolean;
  paramsSerializer?: (params: any) => string; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export interface HttpGetRequestPayload extends HttpCommonRequestPayload {
  params?: HttpReqParams;
}

export interface HttpBodyRequestPayload extends HttpGetRequestPayload {
  data?: HttpReqData;
  rawData?: boolean;
}

export interface HttpRequestPayload extends HttpGetRequestPayload {
  method: HttpMethod;
}

export interface HttpPostRequestPayload extends HttpBodyRequestPayload { }
export interface HttpPutRequestPayload extends HttpBodyRequestPayload { }
export interface HttpPatchRequestPayload extends HttpBodyRequestPayload { }
export interface HttpDeleteRequestPayload extends HttpBodyRequestPayload { }
export interface HttpHeadRequestPayload extends HttpBodyRequestPayload { }

export interface HttpRawRequestPayload extends
  HttpRequestPayload,
  HttpGetRequestPayload,
  HttpPostRequestPayload,
  HttpPutRequestPayload,
  HttpPatchRequestPayload,
  HttpDeleteRequestPayload,
  HttpHeadRequestPayload { }

export interface HttpRequestedPayload {
  method: HttpMethod;
  url: string;
  path: string;
  headers: HttpHeaders;
}
export interface HttpRequestResponse<T> {
  body: T;
  status: number;
  statusText: string;
  headers?: HttpHeaders;
  request: HttpRequestedPayload;
}

export interface HttpRequestResponseError<T> extends HttpRequestResponse<T> {
  errorMessage: string;
}

export class HttpHelper {
  public async request<T>(payload: HttpRawRequestPayload): Promise<HttpRequestResponse<T> | HttpRequestResponseError<T>> {
    try {
      if (payload.data && typeof payload.data === "object" && payload.rawData !== true) {
        payload.data = JSON.parse(
          JSON.stringify(payload.data, (_k, v) => typeof v === "bigint" ? v.toString() : v)
        );
      }

      if (payload.debug === true) {
        // eslint-disable-next-line no-console
        console.debug("> HttpHelper.request, Request", payload);
      }

      const e = await axios.request(payload);
      const resp = {} as HttpRequestResponse<T>;

      resp.body = e.data;
      resp.status = e.status;
      resp.statusText = e.statusText;
      resp.headers = e.headers;
      resp.request = {
        method: String(e.config.method).toUpperCase() as HttpMethod,
        url: e.config.url,
        path: e.request.path,
        headers: e.config.headers,
      };

      if (payload.debug === true) {
        // eslint-disable-next-line no-console
        console.debug("> HttpHelper.request, Succeed Response", {
          status: resp.status,
          headers: resp.headers,
          body: resp.body,
        });
      }

      return resp;
    } catch (e) {
      const resp = {} as HttpRequestResponseError<T>;

      // Not a valid HTTP Error
      if (!e.response) {
        throw e;
      }

      resp.body = e.response.data;
      resp.status = e.response.status;
      resp.statusText = e.response.statusText;
      resp.headers = e.response.headers;
      resp.errorMessage = e.message;
      resp.request = {
        method: e.config.method,
        url: e.config.url,
        path: e.request.path,
        headers: e.config.headers,
      };

      if (payload.debug === true) {
        // eslint-disable-next-line no-console
        console.debug("> HttpHelper.request, Failed Response", {
          errorMessage: resp.errorMessage,
          status: resp.status,
          headers: resp.headers,
          body: resp.body,
        });
      }

      return resp;
    }
  }

  public get<T>(payload: HttpGetRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Get }) as Promise<HttpRequestResponse<T>>;
  }

  public post<T>(payload: HttpPostRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Post }) as Promise<HttpRequestResponse<T>>;
  }

  public put<T>(payload: HttpPutRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Put }) as Promise<HttpRequestResponse<T>>;
  }

  public patch<T>(payload: HttpPatchRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Patch }) as Promise<HttpRequestResponse<T>>;
  }

  public delete<T>(payload: HttpDeleteRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Delete }) as Promise<HttpRequestResponse<T>>;
  }

  public head<T>(payload: HttpHeadRequestPayload): Promise<HttpRequestResponse<T>> {
    return this.request({ ...payload, method: HttpMethod.Head }) as Promise<HttpRequestResponse<T>>;
  }
}
