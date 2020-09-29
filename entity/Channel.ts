import {
  Entity,
  Index,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { Role } from './Role';
import { DiscordEntity } from './concerns/DiscordEntity';

export enum ChannelKind {
  BATCH = 'BatchChannel',
  LOBBY = 'LobbyChannel',
}

interface IGetNameProps {
  kind: ChannelKind;
  courseCode: string;
  courseKind?: string;
  batchCode?: string;
}

@Entity()
@Index(['kind', 'courseKind', 'courseCode', 'batchCode'], { unique: true })
export class Channel extends DiscordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ChannelKind })
  kind: ChannelKind;

  @Column()
  courseCode: string;

  @Column({ nullable: true })
  @Check(`"kind" != '${ChannelKind.BATCH}' OR "courseKind" IS NOT NULL`)
  @Check(
    `"kind" != '${ChannelKind.LOBBY}' OR ("kind" = '${ChannelKind.LOBBY}' AND "courseKind" IS NULL)`,
  )
  courseKind: string;

  @Column({ nullable: true })
  @Check(`"kind" != '${ChannelKind.BATCH}' OR "batchCode" IS NOT NULL`)
  @Check(
    `"kind" != '${ChannelKind.LOBBY}' OR ("kind" = '${ChannelKind.LOBBY}' AND "batchCode" IS NULL)`,
  )
  batchCode: string;

  @OneToMany('Role', 'channel', { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  roles: Role[];

  getName(): string {
    const { kind, courseCode, courseKind, batchCode } = this;
    return this.name || (this.name = Channel.getName({ kind, courseCode, courseKind, batchCode }));
  }

  static getName({ kind, courseCode, courseKind, batchCode }: IGetNameProps): string {
    if (kind === ChannelKind.BATCH) return batchCode.toUpperCase();
    if (kind === ChannelKind.LOBBY) return `${courseCode}-${courseKind}`.toUpperCase();

    return '';
  }
}
