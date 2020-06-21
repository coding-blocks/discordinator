import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './User';
import { Channel } from './Channel';
import { UserRolesRole } from './UserRolesRole';
import { RoleKind, ChannelKind } from '~/types';
import { DiscordEntity } from './concerns/DiscordEntity';

@Entity()
export class Role extends DiscordEntity {
  @Column({ type: 'enum', enum: RoleKind })
  kind: RoleKind;

  @ManyToOne('Channel', 'roles', { eager: true })
  channel: Channel;

  @ManyToMany('User', 'roles')
  users: User[];

  @OneToMany('UserRolesRole', 'role')
  roleUsers: UserRolesRole[];

  get name(): string {
    return Role.getName({ kind: this.kind, channel: this.channel });
  }

  static getName({
    kind,
    channel,
  }: {
    kind: RoleKind;
    channel: Channel;
  }): string {
    if (channel.kind === ChannelKind.LOBBY)
      return `${kind}/${channel.courseCode}`.toUpperCase();

    if (channel.kind === ChannelKind.BATCH)
      return `${kind}/${channel.name}`.toUpperCase();

    return '';
  }
}
