export interface Paginator<T> {
    count: bigint;
    page: number;
    rpp: number;
    items: T[];
}
