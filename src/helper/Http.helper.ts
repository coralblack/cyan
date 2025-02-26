import axios from "axios";
import { HttpMethod } from "../http/Http.method";
import { Headers as HttpHeaders, ReqData as HttpReqData, ReqParams as HttpReqParams } from "../types/Http";

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

export interface HttpPostRequestPayload extends HttpBodyRequestPayload {}
export interface HttpPutRequestPayload extends HttpBodyRequestPayload {}
export interface HttpPatchRequestPayload extends HttpBodyRequestPayload {}
export interface HttpDeleteRequestPayload extends HttpBodyRequestPayload {}
export interface HttpHeadRequestPayload extends HttpBodyRequestPayload {}

export interface HttpRawRequestPayload
  extends HttpRequestPayload,
    HttpGetRequestPayload,
    HttpPostRequestPayload,
    HttpPutRequestPayload,
    HttpPatchRequestPayload,
    HttpDeleteRequestPayload,
    HttpHeadRequestPayload {}

export interface HttpRequestedPayload {
  method: HttpMethod;
  url?: string;
  path: string;
  headers?: HttpHeaders;
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          JSON.stringify(payload.data, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
        );
      }

      if (payload.debug === true) {
        // eslint-disable-next-line no-console
        console.debug("> HttpHelper.request, Request", payload);
      }

      const reqResponse = await axios.request(payload);
      const resp = {} as HttpRequestResponse<T>;

      resp.body = reqResponse.data;
      resp.status = reqResponse.status;
      resp.statusText = reqResponse.statusText;
      resp.headers = reqResponse.headers;
      resp.request = {
        method: String(reqResponse.config.method).toUpperCase() as HttpMethod,
        url: reqResponse.config.url,
        path: reqResponse.request.path,
        headers: reqResponse.config.headers,
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
    } catch (err: any) {
      const resp = {} as HttpRequestResponseError<T>;

      // Not a valid HTTP Error
      if (!err?.response) {
        throw err;
      }

      resp.body = err.response.data;
      resp.status = err.response.status;
      resp.statusText = err.response.statusText;
      resp.headers = err.response.headers;
      resp.errorMessage = err.message;
      resp.request = {
        method: err.config.method,
        url: err.config.url,
        path: err.request.path,
        headers: err.config.headers,
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
