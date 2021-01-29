export declare function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
export declare function getConstructorName<T extends {}>(obj: T): string;
