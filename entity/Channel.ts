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
  courseKind: string;

  @Column({ nullable: true })
  @Check(`"kind" != '${ChannelKind.BATCH}' OR "batchCode" IS NOT NULL`)
  batchCode: string;

  @OneToMany('Role', 'channel', { cascade: true })
  @JoinColumn()
  roles: Role[];

  getName(): string {
    return (
      this.name ||
      (this.name = Channel.getName({
        kind: this.kind,
        courseCode: this.courseCode,
        courseKind: this.courseKind,
        batchCode: this.batchCode,
      }))
    );
  }

  static getName({
    kind,
    courseCode,
    courseKind,
    batchCode,
  }: {
    kind: ChannelKind;
    courseCode: string;
    courseKind?: string;
    batchCode?: string;
  }): string {
    if (kind === ChannelKind.BATCH) return `${courseKind}-${courseCode}-${batchCode}`.toUpperCase();
    if (kind === ChannelKind.LOBBY) return `lobby-${courseCode}`.toUpperCase();

    return '';
  }
}
