export declare enum RelationEntityColumnType {
    OneToOne = "ONE-TO-ONE"
}
export interface RelationEntityColumnOptions {
    name: string;
    referencedColumnName?: string;
}
export declare function OneToOne(options: RelationEntityColumnOptions): PropertyDecorator;
