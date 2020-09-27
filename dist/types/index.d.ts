export declare type ClassType<T> = {
    new (...args: any[]): T;
};
export declare type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
