import { BaseEntity } from './BaseEntity';
import { IsDefined, IsInt, Min, IsDate, IsOptional } from 'class-validator';
import {
  Column,
  Index,
  Check,
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  IsNull,
  Raw,
  FindManyOptions,
} from 'typeorm';

export abstract class DiscordEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  discordId: string;

  @Column({ nullable: true })
  @Check('"discordSyncedAt" IS NULL OR "discordSyncTriedAt" IS NOT NULL')
  @IsDate()
  @IsOptional()
  discordSyncedAt: Date;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  discordSyncTriedAt: Date;

  name: string;

  abstract getName(): string;

  @AfterLoad()
  @AfterUpdate()
  setName() {
    this.name = this.getName();
  }

  synced: boolean;

  @AfterLoad()
  @AfterUpdate()
  setSynced() {
    let synced = true;

    if (this.discordSyncedAt === null) synced = false;
    if (this.discordSyncTriedAt === null) synced = false;
    if (this.discordSyncTriedAt > this.discordSyncedAt) synced = false;
    if (this.updatedAt > this.discordSyncedAt) synced = false;

    this.synced = synced;
  }

  static async findAllUnSynced<T extends DiscordEntity>(
    options: FindManyOptions<T> = {},
  ): Promise<T[]> {
    return ((await this.getRepository().find({
      ...(options as object),
      where: [
        { discordSyncedAt: IsNull() },
        { discordSyncTriedAt: IsNull() },
        { updatedAt: Raw((alias) => `${alias} > "User"."discordSyncedAt"`) },
        { discordSyncTriedAt: Raw((alias) => `${alias} > "User"."discordSyncedAt"`) },
      ],
    })) as any) as Promise<T[]>;
  }
}
