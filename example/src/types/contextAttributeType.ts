import { ContextParamAttributes } from "@coralblack/cyan/dist/router";
import { AuthorizedContext, CyanRequestContext } from "src/controller/middleware/BasicAuthMiddleware";
import { CyanRequest } from "../../../dist/types/Handler";

declare module "@coralblack/cyan/dist/router" {
  export interface ContextParamAttributes {
    requestContext: CyanRequestContext;
    authContext: AuthorizedContext;
  }

  export type ContextAttributeKeyType = keyof ContextParamAttributes;

  export interface CyanRequestContextParamOptions {
    attr: ContextAttributeKeyType;
  }
}

declare module "@coralblack/cyan/dist/types" {
  export interface HelloCyanRequest extends CyanRequest {
    executionContext: ContextParamAttributes;
  }
}
