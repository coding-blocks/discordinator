import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { UserRole } from './UserRole';
import { Channel, ChannelKind } from './Channel';
import { DiscordEntity } from './concerns/DiscordEntity';
import { IsDefined, IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export enum RoleKind {
  STUDENT = 'Student',
  ASSISTANT = 'Assistant',
}

@Entity()
@Index(['kind', 'channel'], { unique: true })
export class Role extends DiscordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RoleKind })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(RoleKind)
  kind: RoleKind;

  @ManyToOne('Channel', 'roles', { eager: true, nullable: false })
  channel: Channel;

  @IsDefined()
  @IsInt()
  channelId: number;

  @ManyToMany('User', 'roles')
  users: User[];

  @OneToMany('UserRole', 'role')
  roleUsers: UserRole[];

  getName(): string {
    return this.name || (this.name = Role.getName({ kind: this.kind, channel: this.channel }));
  }

  static getName({ kind, channel }: { kind: RoleKind; channel: Channel }): string {
    if (channel.kind === ChannelKind.LOBBY) return `${kind}/${channel.courseCode}`.toUpperCase();

    if (channel.kind === ChannelKind.BATCH)
      return `${kind}/${Channel.getName(channel)}`.toUpperCase();

    return '';
  }

  static RoleKind = RoleKind;
}
