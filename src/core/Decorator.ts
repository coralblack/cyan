import { 
  MiddlewareMetadataArgs,
  RelationEntityColumnMetadataArgs,
  RepositoryColumnMetadataArgs,
  RepositoryMetadataArgs,
  RouteMetadataArgs,
  RouteParamMetadataArgs,
  TaskMetadataArgs
} from "../types/MetadataArgs";

class MetadataStorage {
  public readonly routes: RouteMetadataArgs[] = [];
  public readonly routeParams: RouteParamMetadataArgs[] = [];
  public readonly middlewares: MiddlewareMetadataArgs[] = [];
  public readonly repositories: RepositoryMetadataArgs[] = [];
  public readonly repositoryColumns: RepositoryColumnMetadataArgs[] = [];
  public readonly relationEntityColumns: RelationEntityColumnMetadataArgs[] = [];
  public readonly tasks: TaskMetadataArgs[] = [];
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
