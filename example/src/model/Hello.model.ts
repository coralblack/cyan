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

@Entity({ name: "MUL_PRI" })
class MulPriEntity {
  @PrimaryColumn({ name: "PRIMARY_ID", default: () => "UUID_SHORT()" })
  primaryId: bigint;

  @PrimaryColumn({ name: "SECONDARY_ID", default: () => "UUID_SHORT()" })
  secondaryId: bigint;

  @Column({ name: "FOO" })
  foo: string;

  @Column({ name: "BAR" })
  bar: string;
}

@Entity({ name: "MUL_PRI_JOIN" })
class MulPriJoinEntity {
  @PrimaryColumn({ name: "ID", default: () => "UUID_SHORT()" })
  id: bigint;

  @Column({ name: "FOO" })
  foo: string;

  @Column({ name: "PRIMARY_ID" })
  primaryId: bigint;

  @Column({ name: "SECONDARY_ID" })
  secondaryId: bigint;

  @OneToOne({ name: ["PRIMARY_ID", "SECONDARY_ID"], target: MulPriEntity })
  mul?: MulPriEntity;
}

export class HelloModel extends BaseModel {
  async test(): Promise<void> {
    await this.transactionWith<HelloEntity>(async scope => {
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

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS MUL_PRI (
            PRIMARY_ID BIGINT(20) NOT NULL,
            SECONDARY_ID BIGINT(20) NOT NULL,
            FOO VARCHAR(128) DEFAULT NULL,
            BAR VARCHAR(128) DEFAULT NULL,
            PRIMARY KEY (PRIMARY_ID, SECONDARY_ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS MUL_PRI_JOIN (
            ID BIGINT(20) NOT NULL AUTO_INCREMENT,
            FOO VARCHAR(128) DEFAULT NULL,
            PRIMARY_ID BIGINT(20) DEFAULT NULL,
            SECONDARY_ID BIGINT(20) DEFAULT NULL,
            PRIMARY KEY (ID)
        )
      `);

      await scope.execute(`
        CREATE TABLE IF NOT EXISTS PAGES (
          ID BIGINT(20) NOT NULL AUTO_INCREMENT,
          CATEGORY VARCHAR(128) NOT NULL,
          CHAPTER VARCHAR(128) NOT NULL,
          PART VARCHAR(128) NOT NULL,
          PAGE INT(3) NOT NULL,
          PRIMARY KEY (ID)
        )
      `)

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

      assert(save1 > 100000000, "save1 > 100000000");

      const found1 = await repo.findOne({ where: { id: save1 as bigint } });

      assert(found1.id === BigInt(save1), "found1.id");
      assert(found1.worldId === BigInt(worldId), "found1.worldId");
      assert(found1.name === save1Name, "found1.name");
      assert(found1.createdAt === null, "found1.createdAt");
      assert(found1.world && typeof found1.world === "object", "found1.world");
      assert(found1.world.id === BigInt(worldId), "found1.world.id");
      assert(found1.world.name === "world", "found1.world.name");
      assert(found1.world.createdAt === null, "found1.world.createdAt");

      const foundSpSelect = await repo.findOne({ where: { id: save1 as bigint }, select: ["name"] });

      assert(Object.keys(foundSpSelect).join(",") === "name");

      const foundSpSelectJoin = await repo.findOne({ where: { id: save1 as bigint }, select: ["name", "world"] });

      assert(Object.keys(foundSpSelectJoin).join(",") === "name,world");

      const foundLike = await repo.findOne({ where: { name: { LIKE: save1Name } } });

      assert(foundLike.id === BigInt(save1), "foundLike.id");

      const foundLikeBegin = await repo.findOne({ where: { name: { "LIKE%": save1Name.slice(0, -1) } } });

      assert(foundLikeBegin.id === BigInt(save1), "foundLikeBegin.id");

      const foundLikeEnd = await repo.findOne({ where: { name: { "%LIKE": save1Name.slice(1) } } });

      assert(foundLikeEnd.id === BigInt(save1), "foundLikeEnd.id");

      const foundLikeBetween = await repo.findOne({ where: { name: { "%LIKE%": save1Name.slice(1, -1) } } });

      assert(foundLikeBetween.id === BigInt(save1), "foundLikeBetween.id");

      const save2Id = BigInt(new Date().getTime());
      const save2Name = `${new Date().getTime()}`;
      const save2 = await repo.save({
        id: save2Id,
        name: save2Name,
        createdAt: new Date(),
      });

      assert(save2Id === save2, "save2Id === save2");

      const save3Id = BigInt(new Date().getTime() + 1234);
      const save3 = await repo.save({ id: save3Id } as any);
      const found3 = await repo.findOne({ where: { id: save3 as bigint } });

      assert(found3.name.length === "2ca4d1cc-010c-11eb-8052-51e99d56d62f".length, "found3.name.length");
      assert(found3.createdAt.getTime() > 1000000, "found3.createdAt.getTime");

      const found = await repo.findOne({
        select: ["name"],
        where: {
          id: (k: string) => `${k} = ${save2Id}`,
          name: [save2Name, "xxx"],
        },
      });

      const founds = await repo.find({ limit: 3 });

      assert(!!found, "!!found");
      assert(founds.length > 0, "founds.length");

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

      const queryOrder3 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
        order: [{ createdAt: (k: string) => `${k} IS NOT NULL, ${k} DESC` }, { createdAt: "ASC" }],
      });

      assert(queryOrder1.id && queryOrder3.id && String(queryOrder1.id) !== String(queryOrder3.id), "failed order by");

      const queryOrder4 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
        order: [{ createdAt: "ASC" }, { createdAt: (k: string) => `${k} IS NOT NULL, ${k} DESC` }],
      });

      assert(queryOrder4.id && queryOrder3.id && String(queryOrder4.id) !== String(queryOrder3.id), "failed order by");

      const queryPagination1 = await repo.pagination({ page: 1, rpp: 2, order: { id: "DESC" } });
      const queryPagination2 = await repo.pagination({ page: 1, rpp: 1, order: { id: "DESC" } });
      const queryPagination3 = await repo.pagination({ page: 2, rpp: 1, order: { id: "DESC" } });

      assert(
        queryPagination1.items[0].id === queryPagination2.items[0].id,
        "queryPagination1.items[0].id === queryPagination2.items[0].id"
      );
      assert(
        queryPagination1.items[1].id === queryPagination3.items[0].id,
        "queryPagination1.items[1].id === queryPagination3.items[0].id"
      );

      const queryRaw = await scope.execute("SELECT ID FROM HELLO WHERE ID = ?", [queryPagination1.items[0].id]);

      assert(queryPagination1.items[0].id === queryRaw[0].ID, "queryPagination1.items[0].id === queryRaw[0].ID");

      await this.transactionWith(async innerScope => {
        const repoX = innerScope.getRepository(HelloEntity);
        const foundX = await repoX.findOne({ where: { id: queryPagination1.items[0].id } });

        assert(foundX.id === queryPagination1.items[0].id, "foundX.id");
      }, scope);

      const queryNotEq = await repo.pagination({
        where: {
          $AND: [
            { $AND: { id: [queryPagination1.items[0].id, queryPagination1.items[1].id] } },
            { $AND: { id: { "!=": queryPagination1.items[0].id } } },
          ],
        },
      });

      assert(queryNotEq.count === BigInt(1), "queryNotEq");

      const query1 = await repo.findOne({
        where: {
          createdAt: {
            ">=": new Date("2000-01-01 00:00:00"),
            "<=": () => "CURRENT_TIMESTAMP()",
          },
        },
      });

      assert(!!query1, "!!query1");

      const query2 = await repo.findOne({ where: { createdAt: { IS_NULL: true } } });

      assert(!!query2, "!!query2");

      const query3 = await repo.findOne({ where: { createdAt: { IS_NULL: false } } });

      assert(!!query3, "!!query3");

      const query4 = await repo.findOne({ where: { createdAt: { IS_NOT_NULL: true } } });

      assert(!!query4, "!!query4");

      const query5 = await repo.findOne({ where: { createdAt: { IS_NOT_NULL: false } } });

      assert(!!query5, "!!query5");

      const updated1 = await repo.update(entity, { update: ["name"], where: { name: updateName } });

      assert(updated1 === 0, "updated1");

      const updated2 = await repo.update(entity, { update: ["name"] });

      assert(updated2 === 1, "updated2");

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
      assert(latestFoo.bar.id === latestBar.id, "latestFoo.bar.id");
      assert(latestFoo.bar.baz.id === latestBaz.id, "latestFoo.bar.baz.id");
      assert(latestFoo.bar.baz.foz.id === latestFoz.id, "latestFoo.bar.baz.foz.id");
      assert(typeof latestFoo.bar.baz.foz.id === "bigint", "typeof latestFoo.bar.baz.foz.id");

      const helloEntities = await repo.find({ limit: 2 });
      const orWhere1 = await repo.find({ where: { $OR: { id: helloEntities[0].id, name: helloEntities[1].name } } });
      const orWhere2 = await repo.find({ where: { name: { $OR: [{ LIKE: helloEntities[0].name }, { LIKE: helloEntities[1].name }] } } });
      const andWhere1 = await repo.find({ where: { $AND: { id: helloEntities[0].id, name: helloEntities[0].name } } });
      const andWhere2 = await repo.find({ where: { $AND: { id: helloEntities[0].id, name: helloEntities[1].name } } });
      const andWhere3 = await repo.find({ where: { name: { $AND: [{ LIKE: helloEntities[0].name }, { LIKE: helloEntities[1].name }] } } });

      assert(orWhere1.length === 2, "orWhere.length === 2");
      assert(orWhere2.length === 2, "orWhere2.length === 2");
      assert(andWhere1.length === 1, "andWhere1.length === 1");
      assert(andWhere2.length === 0, "andWhere2.length");
      assert(andWhere3.length === 0, "andWhere3.length === 0");

      const andWhere4 = await repo.find({
        where: {
          $OR: [
            { $AND: { id: helloEntities[0].id, name: helloEntities[0].name } },
            { $AND: { id: helloEntities[1].id, name: helloEntities[1].name } },
          ],
        },
      });

      assert(
        andWhere4.length === 2 && andWhere4[0].id === helloEntities[0].id && andWhere4[1].id === helloEntities[1].id,
        "andWhere4.length === 2"
      );

      const andWhere5 = await repo.find({
        where: {
          $AND: [
            { $AND: { id: helloEntities[0].id, name: helloEntities[0].name } },
            { $AND: { id: helloEntities[1].id, name: helloEntities[1].name } },
          ],
        },
      });

      assert(andWhere5.length === 0, "andWhere5.length === 0");

      const mulPriRepo = scope.getRepository(MulPriEntity);
      const mulPriJoinRepo = scope.getRepository(MulPriJoinEntity);

      const primaryId = BigInt(`${new Date().getTime()}${Math.ceil(Math.random() * 1000000)}`);
      const secondaryId = primaryId + BigInt(1);
      const mulPriFoo = `${new Date().getTime()}-${Math.random()}-${Math.random()}`;

      await mulPriRepo.save({
        primaryId: primaryId,
        secondaryId: secondaryId,
        foo: mulPriFoo,
        bar: `${new Date().getTime()}`,
      });

      await mulPriRepo.save({
        primaryId: primaryId + BigInt(2),
        secondaryId: secondaryId + BigInt(3),
        foo: mulPriFoo,
        bar: `${new Date().getTime()}`,
      });

      await mulPriRepo.save({
        primaryId: primaryId + BigInt(3),
        secondaryId: secondaryId + BigInt(4),
        foo: mulPriFoo,
        bar: `${new Date().getTime()}`,
      });

      const countMulPri = await mulPriRepo.count({});

      await mulPriRepo.delete({
        primaryId: primaryId + BigInt(2),
        secondaryId: secondaryId + BigInt(3),
        foo: mulPriFoo,
        bar: `${new Date().getTime()}`,
      });

      const countMulPriAfter = await mulPriRepo.count({});

      assert(countMulPriAfter + BigInt(1) === countMulPri, "await mulPriRepo.count({}) + BigInt(1) === countMulPri");

      await mulPriJoinRepo.save({
        id: primaryId,
        foo: mulPriFoo,
        primaryId,
        secondaryId,
      });

      const mulPriJoinEntity = await mulPriJoinRepo.findOne({ where: { id: primaryId } });

      assert(mulPriJoinEntity.foo === mulPriFoo, "mulPriJoinEntity.foo === mulPriFoo");
      assert(mulPriJoinEntity.mul?.primaryId === primaryId, "mulPriJoinEntity.mul.primaryId === primaryId");

      return null;
    });

    return null;
  }
}
