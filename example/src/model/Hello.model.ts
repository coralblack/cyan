/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { assert } from "console";
import { Column, Entity, OneToOne, PrimaryColumn } from "@coralblack/cyan/dist/model";
import { BaseModel } from "./Base.model";

@Entity({ name: "WORLD" })
class WorldEntity {
  @PrimaryColumn({ name: "ID" })
  id: bigint;

  @Column({ name: "NAME", default: () => "UUID()" })
  name: string;

  @Column({ name: "CREATED_AT", default: () => "CURRENT_TIMESTAMP()" })
  createdAt: Date;
}

@Entity({ name: "HELLO" })
class HelloEntity {
  @PrimaryColumn({ name: "ID" })
  id: bigint;

  @Column({ name: "NAME", default: () => "UUID()" })
  name: string;

  @Column({ name: "WORLD_ID" })
  worldId?: bigint;

  @OneToOne({ name: "WORLD_ID", target: WorldEntity })
  world?: WorldEntity;

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

@Entity({ name: "FOZ" })
class FozEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "NAME", default: () => "UUID()" })
  name: string;

  @Column({ name: "CREATED_AT", default: () => "CURRENT_TIMESTAMP()" })
  createdAt: Date;
}

@Entity({ name: "BAZ" })
class BazEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "FOZ_ID" })
  fozId: bigint;

  @OneToOne({ name: "FOZ_ID", target: FozEntity })
  foz?: FozEntity;
}

@Entity({ name: "BAR" })
class BarEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "BAZ_ID" })
  bazId: bigint;

  @OneToOne({ name: "BAZ_ID", target: BazEntity })
  baz?: BazEntity;

  @Column({ name: "BAZ2_ID" })
  baz2Id: bigint;

  @OneToOne({ name: "BAZ2_ID", target: BazEntity })
  baz2?: BazEntity;
}

@Entity({ name: "FOO" })
class FooEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "BAR_ID" })
  barId: bigint;

  @OneToOne({ name: "BAR_ID", target: BarEntity })
  bar?: BarEntity;
}

export class HelloModel extends BaseModel {
  async test(): Promise<void> {
    await this.transactionWith<HelloEntity>(async (scope) => {
      await scope.execute(`
        CREATE TABLE IF NOT EXISTS HELLO (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            WORLD_ID BIGINT(20) DEFAULT NULL,
            NAME VARCHAR(128) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS WORLD (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            NAME VARCHAR(128) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS FOO (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            BAR_ID BIGINT(20) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS BAR (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            BAZ_ID BIGINT(20) DEFAULT NULL,
            BAZ2_ID BIGINT(20) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS BAZ (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            FOZ_ID BIGINT(20) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS FOZ (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            NAME VARCHAR(128) DEFAULT NULL,
            CREATED_AT DATETIME DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      const worldRepo = scope.getRepository(WorldEntity);
      const worldId = await worldRepo.save({
        id: (() => "UUID_SHORT()") as any,
        name: "world",
        createdAt: null,
      });

      const repo = scope.getRepository(HelloEntity);

      const save1Name = `${Math.random()}-${new Date().getTime()}-${Math.random()}`;
      const save1 = await repo.save({
        id: (() => "UUID_SHORT()") as any,
        worldId: BigInt(worldId),
        name: save1Name,
        createdAt: null,
      });

      assert(save1 > 100000000);

      const found1 = await repo.findOne({ where: { id: save1 as bigint } });

      assert(found1.id === BigInt(save1), "found1.id");
      assert(found1.worldId === BigInt(worldId), "found1.worldId");
      assert(found1.name === save1Name, "found1.name");
      assert(found1.createdAt === null, "found1.createdAt");
      assert(found1.world && typeof found1.world === "object", "found1.world");
      assert(found1.world.id === BigInt(worldId), "found1.world.id");
      assert(found1.world.name === "world", "found1.world.name");
      assert(found1.world.createdAt === null, "found1.world.createdAt");

      const foundLike = await repo.findOne({ where: { name: { LIKE: save1Name } } });

      assert(foundLike.id === BigInt(save1));

      const foundLikeBegin = await repo.findOne({ where: { name: { "LIKE%": save1Name.slice(0, -1) } } });

      assert(foundLikeBegin.id === BigInt(save1));

      const foundLikeEnd = await repo.findOne({ where: { name: { "%LIKE": save1Name.slice(1) } } });

      assert(foundLikeEnd.id === BigInt(save1));

      const foundLikeBetween = await repo.findOne({ where: { name: { "%LIKE%": save1Name.slice(1, -1) } } });

      assert(foundLikeBetween.id === BigInt(save1));

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

      const queryRaw = await scope.execute("SELECT ID FROM HELLO WHERE ID = ?", [queryPagination1.items[0].id]);

      assert(queryPagination1.items[0].id === queryRaw[0].ID);

      await this.transactionWith(async (innerScope) => {
        const repoX = innerScope.getRepository(HelloEntity);
        const foundX = await repoX.findOne({ where: { id: queryPagination1.items[0].id } });

        assert(foundX.id === queryPagination1.items[0].id);
      }, scope);

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

      // Relations

      const fooRepo = scope.getRepository(FooEntity);
      const barRepo = scope.getRepository(BarEntity);
      const bazRepo = scope.getRepository(BazEntity);
      const fozRepo = scope.getRepository(FozEntity);

      const fozEntity: FozEntity = {
        id: undefined,
        name: String(Math.random()),
        createdAt: undefined,
      };

      await fozRepo.save(fozEntity);

      const latestFoz = await fozRepo.findOne({ order: { id: "ASC" } });

      const bazEntity: BazEntity = {
        id: undefined,
        fozId: latestFoz.id,
      };

      await bazRepo.save(bazEntity);

      const latestBaz = await bazRepo.findOne({ order: { id: "ASC" } });

      const barEntity: BarEntity = {
        id: undefined,
        bazId: latestBaz.id,
        baz2Id: latestBaz.id,
      };

      await barRepo.save(barEntity);

      const latestBar = await barRepo.findOne({ order: { id: "ASC" } });

      const fooEntity: FooEntity = {
        id: undefined,
        barId: latestBar.id,
      };

      await fooRepo.save(fooEntity);

      const latestFoo = await fooRepo.findOne({ order: { id: "ASC" } });

      assert(typeof latestFoo.id === "bigint");
      assert(latestFoo.bar.id === latestBar.id);
      assert(latestFoo.bar.baz.id === latestBaz.id);
      assert(latestFoo.bar.baz.foz.id === latestFoz.id);
      assert(typeof latestFoo.bar.baz.foz.id === "bigint");

      return null;
    });

    return null;
  }
}