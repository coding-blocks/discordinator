import { BaseEntity } from './BaseEntity';
import { SyncResult } from '~/services/Sync';
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

  async sync<T extends DiscordEntity>(cb: (T) => Promise<{ id: string } | null>): Promise<boolean> {
    try {
      this.discordSyncTriedAt = new Date();
      await this.save();

      const result = await cb(this);

      if (result && !!result.id) {
        this.discordId = result.id;
        this.updatedAt = new Date();
        this.discordSyncedAt = new Date();
        await this.save();

        return true;
      }
    } catch (err) {
      console.log(err);
    }

    return false;
  }

  abstract getName(): string;

  @AfterLoad()
  @AfterUpdate()
  setName() {
    this.name = this.getName();
  }

  synced: boolean;

  @AfterLoad()
  @AfterUpdate()
  reloadSyncStatus() {
    let synced = true;

    if (this.discordSyncedAt === null) synced = false;
    if (this.discordSyncTriedAt === null) synced = false;
    if (this.discordSyncTriedAt > this.discordSyncedAt) synced = false;
    if (this.updatedAt > this.discordSyncedAt) synced = false;
    if (this.deletedAt > this.discordSyncedAt) synced = false;

    this.synced = synced;
  }

  get deleted(): boolean {
    return !!this.deletedAt;
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
        { deletedAt: Raw((alias) => `${alias} > "User"."discordSyncedAt"`) },
        { discordSyncTriedAt: Raw((alias) => `${alias} > "User"."discordSyncedAt"`) },
      ],
    })) as any) as Promise<T[]>;
  }
}
