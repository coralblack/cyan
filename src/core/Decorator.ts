import {
  ApiTagOptions,
  SwaggerModelMetadata,
  SwaggerOperationMetadata,
  SwaggerPropertyMetadata,
  SwaggerResponseMetadata,
} from "src/swagger";
import {
  EntityColumnMetadataArgs,
  EntityMetadataArgs,
  EntityRelationMetadataArgs,
  MiddlewareMetadataArgs,
  RouteMetadataArgs,
  RouteParamMetadataArgs,
  TaskMetadataArgs,
} from "../types/MetadataArgs";

export class MetadataStorage {
  public readonly routes: RouteMetadataArgs[] = [];
  public readonly routeParams: RouteParamMetadataArgs[] = [];
  public readonly middlewares: MiddlewareMetadataArgs[] = [];
  public readonly entities: EntityMetadataArgs[] = [];
  public readonly entityColumns: EntityColumnMetadataArgs[] = [];
  public readonly entityRelations: EntityRelationMetadataArgs[] = [];
  public readonly tasks: TaskMetadataArgs[] = [];

  // swagger
  public readonly swaggerOperations: SwaggerOperationMetadata[] = [];
  public readonly swaggerProperties: SwaggerPropertyMetadata[] = [];
  public readonly swaggerModels: SwaggerModelMetadata[] = [];
  public readonly swaggerResponses: SwaggerResponseMetadata[] = [];
  public readonly swaggerControllerTags: { target: any; tags: ApiTagOptions[] }[] = [];
}

export class Metadata {
  public static getStorage(): MetadataStorage {
    if ((global as any).decoratorMetadataStorage) {
      return (global as any).decoratorMetadataStorage as MetadataStorage;
    }

    const metadataStorage = new MetadataStorage();

    (global as any).decoratorMetadataStorage = metadataStorage;
    return metadataStorage;
  }
}
