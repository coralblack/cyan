import { HelloCyanRequest } from "@coralblack/cyan/dist/types";
import { NextFunction } from "express";

import { CyanResponse, HandlerFunction } from "../../../../dist/types/Handler";

export interface CyanRequestContext {
  foo: string;
  bar: number;
  boo: {
    innerFoo: string;
    innerBar?: number;
  };
}

export interface AuthorizedContext {
  email: string;
  id: string;
  lastLoginAt: Date;
}

export const BasicAuthMiddleware: HandlerFunction = (req: HelloCyanRequest, res: CyanResponse, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!isValidString(authorization)) {
    return res.status(404).send("authorization header is invalid");
  }

  try {
    const basicAuthContext = externalAuthAPIStub(authorization);

    req.executionContext.authContext = basicAuthContext;
    return next();
  } catch (e) {
    return res.status(404).send("Auth Internal Call Fail");
  }
};

const externalAuthAPIStub = (authorization: string): AuthorizedContext => {
  return { email: "jnpmdei123@jnpmedi.com", id: "123456789", lastLoginAt: new Date() };
};

const isValidString = (arg?: any): arg is string => {
  return arg !== undefined && arg !== null && typeof arg === "string";
};
