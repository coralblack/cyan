/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";

export interface RepositoryOptions {
  name: string;
}

export enum RepositoryColumnType {
  Primary = "PRIMARY",
  Column = "COLUMN"
}

export interface RepositoryColumnOptions {
  name: string;
  default?: (key: string) => string;
}

export function Repository(options?: RepositoryOptions): ClassDecorator {
  return function RouteInner(target: any) {
    Metadata.getStorage().repositories.push({
      target,
      options,
    });
  };
}

function RepositoryColumn(type: RepositoryColumnType, options: RepositoryColumnOptions): PropertyDecorator {
  return function RouteInner(target: any, propertyKey: string) {
    Metadata.getStorage().repositoryColumns.push({
      target: target.constructor,
      propertyKey,
      type,
      options: Object.assign({ name: target.name }, options),
    });
  };
}

export function PrimaryColumn(options: RepositoryColumnOptions): PropertyDecorator {
  return RepositoryColumn(RepositoryColumnType.Primary, options);
}

export function Column(options: RepositoryColumnOptions): PropertyDecorator {
  return RepositoryColumn(RepositoryColumnType.Column, options);
}