export interface EntityOptions {
    name: string;
}
export declare enum EntityColumnType {
    Primary = "PRIMARY",
    Column = "COLUMN"
}
export interface EntityColumnOptions {
    name: string;
    default?: (key: string) => string;
}
export declare function Entity(options?: EntityOptions): ClassDecorator;
export declare function PrimaryColumn(options: EntityColumnOptions): PropertyDecorator;
export declare function Column(options: EntityColumnOptions): PropertyDecorator;
