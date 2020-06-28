import { BaseEntity } from './BaseEntity';
import { Column, Index, Check, AfterInsert, AfterLoad, AfterUpdate } from 'typeorm';
import { IsDefined, IsInt, Min, IsDate, IsOptional } from 'class-validator';

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
    if (this.discordSyncTriedAt > this.discordSyncedAt) synced = false;
    if (this.updatedAt > this.discordSyncedAt) synced = false;

    this.synced = synced;
  }
}
