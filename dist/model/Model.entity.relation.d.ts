export declare enum EntityRelationType {
    OneToOne = "ONE-TO-ONE"
}
export interface EntityRelationColumnOptions<T, F> {
    name: keyof F;
    referencedColumnName?: keyof T;
}
export declare function OneToOne<T, F = any>(options: EntityRelationColumnOptions<T, F>): PropertyDecorator;
