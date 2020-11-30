/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Metadata } from "../core/Decorator";

export enum EntityRelationType {
  OneToOne = "ONE-TO-ONE",
}

export interface EntityRelationColumnOptions<T, F> {
  name: keyof F;
  referencedColumnName?: keyof T;
}

function EntityRelationColumn<T, F>(type: EntityRelationType, options: EntityRelationColumnOptions<T, F>): PropertyDecorator {
  return function EntityRelationColumnInner(target: Object, propertyKey: string) {
    const relationColumnEntity = Reflect.getMetadata("design:type", target, propertyKey);

    Metadata.getStorage().entityRelations.push({
      target: target.constructor,
      propertyKey,
      type,
      table: relationColumnEntity,
      options: Object.assign({ name: (target as any).name }, options),
    });
  };
}

export function OneToOne<T, F = any>(options: EntityRelationColumnOptions<T, F>): PropertyDecorator {
  return EntityRelationColumn<T, F>(EntityRelationType.OneToOne, options);
}