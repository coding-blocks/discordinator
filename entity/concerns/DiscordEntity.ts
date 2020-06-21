import { BaseEntity } from './BaseEntity';
import { Column, Index, Check } from 'typeorm';

export abstract class DiscordEntity extends BaseEntity {
  @Index({ unique: true })
  @Column()
  discordId: string;

  @Column({ nullable: true })
  @Check('"discordSyncedAt" IS NULL OR "discordSyncTriedAt" IS NOT NULL')
  discordSyncedAt: Date;

  @Column({ nullable: true })
  discordSyncTriedAt: Date;

  abstract get name(): Promise<string> | string;

  get synced(): boolean {
    if (this.discordSyncedAt === null) return false;

    if (this.discordSyncTriedAt > this.discordSyncedAt) return false;

    return true;
  }
}
