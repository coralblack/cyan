/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";
import { ClassType } from "../types";

export enum EntityRelationType {
  OneToOne = "ONE-TO-ONE",
}

export interface EntityRelationColumnOptions {
  name: string | string[];
  target: ClassType<any>;
}

function EntityRelationColumn(type: EntityRelationType, options: EntityRelationColumnOptions): PropertyDecorator {
  return function EntityRelationColumnInner(target: Object, propertyKey: string | symbol) {
    const relationColumnEntity = Reflect.getMetadata("design:type", target, propertyKey);

    Metadata.getStorage().entityRelations.push({
      target: target.constructor,
      propertyKey,
      type,
      table: relationColumnEntity,
      options,
    });
  };
}

export function OneToOne(options: EntityRelationColumnOptions): PropertyDecorator {
  return EntityRelationColumn(EntityRelationType.OneToOne, options);
}
