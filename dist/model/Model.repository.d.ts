export interface RepositoryOptions {
    name: string;
}
export declare enum RepositoryColumnType {
    Primary = "PRIMARY",
    Column = "COLUMN"
}
export interface RepositoryColumnOptions {
    name: string;
    default?: (key: string) => string;
}
export declare function Repository(options?: RepositoryOptions): ClassDecorator;
export declare function PrimaryColumn(options: RepositoryColumnOptions): PropertyDecorator;
export declare function Column(options: RepositoryColumnOptions): PropertyDecorator;
