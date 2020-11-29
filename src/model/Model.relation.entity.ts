/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";

export enum RelationEntityColumnType {
  OneToOne = "ONE-TO-ONE",
}

export interface RelationEntityColumnOptions {
  name: string;
  referencedColumnName?: string;
}

function RelationEntityColumn(type: RelationEntityColumnType, options: RelationEntityColumnOptions): PropertyDecorator {
  return function RouteInner(target: any, propertyKey: string) {
    const relationColumnEntity = Reflect.getMetadata("design:type", target, propertyKey);

    Metadata.getStorage().relationEntityColumns.push({
      target: target.constructor,
      propertyKey,
      type,
      table: relationColumnEntity,
      options: Object.assign({ name: target.name }, options),
    });
  };
}

export function OneToOne(options: RelationEntityColumnOptions): PropertyDecorator {
  return RelationEntityColumn(RelationEntityColumnType.OneToOne, options);
}