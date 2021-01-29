export function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
  if (!obj) return false;

  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function getConstructorName<T extends {}>(obj: T): string {
  if (obj && (obj as any).constructor) {
    if (hasOwnProperty(obj.constructor, "name")) {
      return (obj.constructor as any).name as string;
    }
  }

  if (hasOwnProperty(obj, "name")) {
    return obj.name as string;
  }

  return null;
}
