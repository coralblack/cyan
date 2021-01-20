export type RawQuery = (k: string) => string;
export type InsertId = bigint | number;

type FindOperatorComp<T> = Partial<{
  ">=": T | RawQuery;
  ">": T | RawQuery;
  "<=": T | RawQuery;
  "<": T | RawQuery;
  LIKE: T | RawQuery;
  "LIKE%": T;
  "%LIKE": T;
  "%LIKE%": T;
  IS_NULL: boolean;
  IS_NOT_NULL: boolean;
  //
  $AND: Array<FindOperatorComp<T>>;
  $OR: Array<FindOperatorComp<T>>;
}>;

export type FindChainingConditions<T> = Partial<{
  $AND: FindChainingConditions<T> | FindConditions<T>;
  $OR: FindChainingConditions<T> | FindConditions<T>;
}>;

export type FindConditions<T> = {
  [P in keyof T]?: T[P] | T[P][] | FindOperatorComp<T[P]> | RawQuery;
};

export type OrderCondition<T> = { [P in keyof T]?: "ASC" | "DESC" | RawQuery };
export type OrderConditions<T> = OrderCondition<T> | Array<OrderCondition<T>>;

export interface FindOneOptions<T> {
  select?: (keyof T)[];
  where?: FindConditions<T> | FindChainingConditions<T>;
  order?: OrderConditions<T>;
  debug?: boolean;
}

export interface FindOptions<T> extends FindOneOptions<T> {
  offset?: number | bigint;
  limit?: number | bigint;
}

export interface CountOptions<T> extends Omit<FindOneOptions<T>, "select" | "order"> {}

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
