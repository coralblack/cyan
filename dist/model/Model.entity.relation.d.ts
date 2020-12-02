import { ClassType } from "../types";
export declare enum EntityRelationType {
    OneToOne = "ONE-TO-ONE"
}
export interface EntityRelationColumnOptions {
    name: string | string[];
    target: ClassType<any>;
}
export declare function OneToOne(options: EntityRelationColumnOptions): PropertyDecorator;
