/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { assert } from "console";
import { Column, Entity, PrimaryColumn } from "cyan/dist/model";
import { BaseModel } from "./Base.model";

class Hello {

}

@Entity({ name: "HELLO" })
class HelloEntity {
  @PrimaryColumn({ name: "ID" })
  id: bigint;

  @Column({ name: "NAME", default: () => "UUID()" })
  name: string;

  @Column({ name: "CREATED_AT", default: () => "CURRENT_TIMESTAMP()" })
  createdAt: Date;
}

@Entity({ name: "DUMMY" })
class DummyEntity {
  @PrimaryColumn({ name: "ID" })
  id: bigint;

  @Column({ name: "NAME" })
  name: string;

  @Column({ name: "CREATED_AT" })
  createdAt: string;
}

export class HelloModel extends BaseModel {
  async test(): Promise<void> {
    await this.transactionWith<Hello>(async (scope) => {
      await new Promise(r => r());

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS HELLO (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            NAME VARCHAR(128) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      const repo = scope.getRepository(HelloEntity);

      const save1Name = `${new Date().getTime()}`;
      const save1 = await repo.save({
        id: (() => "UUID_SHORT()") as any,
        name: save1Name,
        createdAt: null,
      });

      assert(save1 > 100000000);

      const save2Id = BigInt(new Date().getTime());
      const save2Name = `${new Date().getTime()}`;
      const save2 = await repo.save({
        id: save2Id,
        name: save2Name,
        createdAt: new Date(),
      });

      assert(save2Id === save2);

      const save3Id = BigInt(new Date().getTime() + 1234);
      const save3 = await repo.save({ id: save3Id } as any);
      const found3 = await repo.findOne({ where: { id: save3 as bigint } });

      assert(found3.name.length === "2ca4d1cc-010c-11eb-8052-51e99d56d62f".length);
      assert(found3.createdAt.getTime() > 1000000);

      const found = await repo.findOne({
        select: ["name"],
        where: {
          id: (k: string) => `${k} = ${save2Id}`,
          name: [save2Name, "xxx"],
        },
      });

      const founds = await repo.find({ limit: 3 });

      assert(!!found);
      assert(founds.length > 0);

      const updateName = "xxx";
      const updateCreatedAt = new Date("2020-01-01");
      const entity: HelloEntity = {
        id: save2Id,
        name: updateName,
        createdAt: updateCreatedAt,
      };

      const queryOrder1 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
        order: { createdAt: "ASC" },
      });

      const queryOrder2 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
        order: { createdAt: (k: string) => `${k} IS NOT NULL, ${k} DESC` },
      });

      assert(queryOrder1.id && queryOrder2.id && String(queryOrder1.id) !== String(queryOrder2.id), "failed order by");

      const queryPagination1 = await repo.pagination({ page: 1, rpp: 2, order: { createdAt: "DESC" } });
      const queryPagination2 = await repo.pagination({ page: 1, rpp: 1, order: { createdAt: "DESC" } });
      const queryPagination3 = await repo.pagination({ page: 2, rpp: 1, order: { createdAt: "DESC" } });

      assert(queryPagination1.items[0].id === queryPagination2.items[0].id);
      assert(queryPagination1.items[1].id === queryPagination3.items[0].id);

      const query1 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
      });

      assert(!!query1);

      const query2 = await repo.findOne({ where: { createdAt: { IS_NULL: true } } });

      assert(!!query2);

      const query3 = await repo.findOne({ where: { createdAt: { IS_NULL: false } } });

      assert(!!query3);

      const query4 = await repo.findOne({ where: { createdAt: { IS_NOT_NULL: true } } });

      assert(!!query4);

      const query5 = await repo.findOne({ where: { createdAt: { IS_NOT_NULL: false } } });

      assert(!!query5);

      const updated1 = await repo.update(entity, { update: ["name"], where: { name: updateName } });

      assert(updated1 === 0);

      const updated2 = await repo.update(entity, { update: ["name"] });

      assert(updated2 === 1);

      const updated3 = await repo.update(entity, { update: ["name"], where: { name: updateName } });

      assert(updated3 === 1, "updated3 failed");

      const updated4 = await repo.update(entity, { update: ["name"], where: { name: updateName, createdAt: updateCreatedAt } });

      assert(updated4 === 0, "updated4 failed");

      const updated5 = await repo.update(entity);

      assert(updated5 === 1, "updated5 failed");

      const updated6 = await repo.update(entity, { where: { name: updateName, createdAt: updateCreatedAt } });

      assert(updated6 === 1, "updated6 failed");

      const found6 = await repo.findOne({ where: { id: save2Id } });

      assert(found6.id === entity.id && found6.name === updateName && found6.createdAt.getTime() === updateCreatedAt.getTime());

      const deleted1 = await repo.delete(entity, { where: { name: `${updateName}--` } });

      assert(deleted1 === 0, "deleted1 failed");

      const deleted2 = await repo.delete(entity, { where: { name: updateName } });

      assert(deleted2 === 1, "deleted2 failed");

      const found7 = await repo.findOne({ where: { id: save2Id } });

      assert(found7 === null, "found7 failed");

      return null;
    });

    return null;
  }
}