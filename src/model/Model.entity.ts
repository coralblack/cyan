/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";
import { ClassType } from "../types";
import { hasOwnProperty } from "../util/builtin";

export interface EntityOptions {
  name: string;
}

export enum EntityColumnType {
  Primary = "PRIMARY",
  Column = "COLUMN",
}

export type EntityColumnOptions = EntityTableColumnOptions | EntityRawColumnOptions;

export interface EntityTableColumnOptions {
  name: string;
  default?: (tableName: string) => string;
}

export interface EntityRawColumnOptions {
  raw: (tableName: string) => string;
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
    if (propertyKey.includes("_")) {
      throw new Error(`Invalid Usage: Underscore is not allowed for the property key. (${propertyKey})`);
    }

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

export function getEntityProperties<T>(entity: ClassType<T>): Array<keyof T> {
  return Metadata.getStorage()
    .entityColumns.filter(x => x.target === entity)
    .map(x => x.propertyKey)
    .concat(
      Metadata.getStorage()
        .entityRelations.filter(x => x.target === entity)
        .map(x => x.propertyKey)
    ) as Array<keyof T>;
}

export function getColumnByEntityProperty<T>(entity: ClassType<T>, propertyKey: keyof T): string | undefined {
  return (v => (hasOwnProperty(v.options, "name") ? v.options.name : undefined))(
    Metadata.getStorage().entityColumns.find(x => x.target === entity && x.propertyKey === propertyKey)
  );
}
