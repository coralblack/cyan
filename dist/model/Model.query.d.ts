export interface Paginator<T> {
    count: bigint;
    page: number;
    rpp: number;
    items: T[];
}
export declare type RawQuery = (k: string) => string;
export declare type InsertId = bigint | number;
declare type FindOperatorComp<T> = {
    ">=": T | RawQuery;
    ">": T | RawQuery;
    "<=": T | RawQuery;
    "<": T | RawQuery;
    "IS_NULL": boolean;
    "IS_NOT_NULL": boolean;
};
export declare type FindConditions<T> = {
    [P in keyof T]?: T[P] | T[P][] | Partial<FindOperatorComp<T[P]>> | RawQuery;
};
export declare type OrderCondition<T> = {
    [P in keyof T]?: "ASC" | "DESC" | RawQuery;
};
export interface FindOneOptions<T> {
    select?: (keyof T)[];
    where?: FindConditions<T>;
    order?: OrderCondition<T>;
    debug?: boolean;
}
export interface FindOptions<T> extends FindOneOptions<T> {
    offset?: number | bigint;
    limit?: number | bigint;
}
export interface PaginationOptions<T> extends FindOneOptions<T> {
    page?: number;
    rpp?: number;
}
export interface Paginatable<T> {
    page: number;
    rpp: number;
    count: bigint;
    items: Array<T>;
}
export interface UpdateOptions<T> {
    where?: FindConditions<T>;
    update?: (keyof T)[];
    debug?: boolean;
}
export interface DeleteOptions<T> {
    where?: FindConditions<T>;
    debug?: boolean;
}
export {};
