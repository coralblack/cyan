import { HttpMethod } from "../http/Http.method";
import { Headers as HttpHeaders, ReqData as HttpReqData, ReqParams as HttpReqParams } from "../types/Http";
export declare type HttpResponseType = "arraybuffer" | "document" | "json" | "text" | "stream";
export interface HttpCommonRequestPayload {
    url: string;
    baseUrl?: string;
    headers?: HttpHeaders;
    timeout?: number;
    responseType?: HttpResponseType;
    debug?: boolean;
    paramsSerializer?: (params: any) => string;
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
export interface HttpPostRequestPayload extends HttpBodyRequestPayload {
}
export interface HttpPutRequestPayload extends HttpBodyRequestPayload {
}
export interface HttpPatchRequestPayload extends HttpBodyRequestPayload {
}
export interface HttpDeleteRequestPayload extends HttpBodyRequestPayload {
}
export interface HttpHeadRequestPayload extends HttpBodyRequestPayload {
}
export interface HttpRawRequestPayload extends HttpRequestPayload, HttpGetRequestPayload, HttpPostRequestPayload, HttpPutRequestPayload, HttpPatchRequestPayload, HttpDeleteRequestPayload, HttpHeadRequestPayload {
}
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
export declare class HttpHelper {
    request<T>(payload: HttpRawRequestPayload): Promise<HttpRequestResponse<T> | HttpRequestResponseError<T>>;
    get<T>(payload: HttpGetRequestPayload): Promise<HttpRequestResponse<T>>;
    post<T>(payload: HttpPostRequestPayload): Promise<HttpRequestResponse<T>>;
    put<T>(payload: HttpPutRequestPayload): Promise<HttpRequestResponse<T>>;
    patch<T>(payload: HttpPatchRequestPayload): Promise<HttpRequestResponse<T>>;
    delete<T>(payload: HttpDeleteRequestPayload): Promise<HttpRequestResponse<T>>;
    head<T>(payload: HttpHeadRequestPayload): Promise<HttpRequestResponse<T>>;
}
