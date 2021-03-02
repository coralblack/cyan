import { Column, Entity, FindOneOptions, PaginationOptions, PrimaryColumn, TransactionScope } from "../../../dist/model";
import { BaseModel } from "./Base.model";

@Entity({ name: "PAGES" })
export class PageEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "CATEGORY" })
  category: string;

  @Column({ name: "CHAPTER" })
  chapter: string;

  @Column({ name: "PART" })
  part: string;

  @Column({ name: "PAGE" })
  page: number;
}

export class PageModel extends BaseModel {
  async findOne(opts: FindOneOptions<PageEntity>) {
    return this.transactionWith(async (ctx: TransactionScope) => {
      const repo = ctx.getRepository(PageEntity);
      const found = await repo.findOne(opts);

      return found;
    });
  }

  async insert(page: PageEntity) {
    return this.transactionWith(async (ctx: TransactionScope) => {
      const repo = ctx.getRepository(PageEntity);
      
      await repo.save(page);
    })
  }

  async getPaginatableItems(
    opts: PaginationOptions<PageEntity>) {
    return this.transactionWith(async (ctx: TransactionScope) => {
      const { rpp, page, groupBy } = opts;

      const repo = ctx.getRepository(PageEntity);
      const items = await repo.pagination(opts);

      return items;
    })
  }
}