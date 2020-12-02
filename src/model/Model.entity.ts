/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";

export interface EntityOptions {
  name: string;
}

export enum EntityColumnType {
  Primary = "PRIMARY",
  Column = "COLUMN"
}

export interface EntityColumnOptions {
  name: string;
  default?: (key: string) => string;
}

export function Entity(options?: EntityOptions): ClassDecorator {
  return function EntityInner(target: any) {
    Metadata.getStorage().entities.push({
      target,
      options,
    });
  };
}

function EntityColumn(type: EntityColumnType, options: EntityColumnOptions): PropertyDecorator {
  return function EntityColumnInner(target: any, propertyKey: string) {
    Metadata.getStorage().entityColumns.push({
      target: target.constructor,
      propertyKey,
      type,
      options,
    });
  };
}

export function PrimaryColumn(options: EntityColumnOptions): PropertyDecorator {
  return EntityColumn(EntityColumnType.Primary, options);
}

export function Column(options: EntityColumnOptions): PropertyDecorator {
  return EntityColumn(EntityColumnType.Column, options);
}