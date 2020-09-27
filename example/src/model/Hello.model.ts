import { assert } from "console";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column, Entity, PrimaryColumn } from "cyan/dist/model";
import { BaseModel } from "./Base.model";

class Hello {

}

@Entity({ name: "HELLO" })
class HelloEntity {
  @PrimaryColumn({ name: "ID" })
  id: bigint;

  @Column({ name: "NAME" })
  name: string;

  @Column({ name: "CREATED_AT" })
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
    await new Promise(r => r());

    const res = await this.transactionWith<Hello>(async (scope) => {
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
        createdAt: new Date(),
      });

      assert(save1 > 0);

      const save2Id = BigInt(new Date().getTime());
      const save2Name = `${new Date().getTime()}`;
      const save2 = await repo.save({
        id: save2Id,
        name: save2Name,
        createdAt: new Date(),
      });

      assert(save2Id === save2);

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

      return null;
    });

    return null;
  }
}