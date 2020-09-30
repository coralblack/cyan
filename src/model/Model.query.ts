export interface Paginator<T> {
  count: bigint;
  page: number;
  rpp: number;
  items: T[];
}

export type RawQuery = (k: string) => string;
export type InsertId = bigint | number;

type FindOperatorComp<T> = {
  ">=": T | RawQuery;
  ">": T | RawQuery;
  "<=": T | RawQuery;
  "<": T | RawQuery;
  "IS_NULL": boolean;
  "IS_NOT_NULL": boolean;
};

export type FindConditions<T> = {
  [P in keyof T]?: T[P] | T[P][] | Partial<FindOperatorComp<T[P]>> | RawQuery;
};

export interface FindOneOptions<T> {
  select?: (keyof T)[];
  where?: FindConditions<T>;
  order?: { [P in keyof T]?: "ASC" | "DESC" };
  debug?: boolean;
}

export interface FindOptions<T> extends FindOneOptions<T> {
  offset?: number | bigint;
  limit?: number | bigint;
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