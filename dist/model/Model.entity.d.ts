export interface EntityOptions {
    name: string;
}
export declare enum EntityColumnType {
    Primary = "PRIMARY",
    Column = "COLUMN"
}
export declare type EntityColumnOptions = EntityTableColumnOptions | EntityRawColumnOptions;
export interface EntityTableColumnOptions {
    name: string;
    default?: (tableName: string) => string;
}
export interface EntityRawColumnOptions {
    raw: (tableName: string) => string;
}
export declare function Entity(options?: EntityOptions): ClassDecorator;
export declare function PrimaryColumn(options: EntityColumnOptions): PropertyDecorator;
export declare function Column(options: EntityColumnOptions): PropertyDecorator;
