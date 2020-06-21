import { Entity, Column, ManyToMany, OneToMany, Index } from 'typeorm';
import { User } from './User';
import { BaseEntity } from './concerns/BaseEntity';
import { BatchChannel } from './BatchChannel';
import { LobbyChannel } from './LobbyChannel';
import { UserRolesRole } from './UserRolesRole';
import {
  RoleKind,
  ChannelKind,
  ChannelPromiseType,
  IDiscordEntity,
} from '~/types';

@Entity()
export class Role extends BaseEntity implements IDiscordEntity {
  @Column({ type: 'enum', enum: RoleKind })
  kind: RoleKind;

  @Index({ unique: true })
  @Column()
  discordId: string;

  @Column({ type: 'enum', enum: ChannelKind })
  channelKind: ChannelKind;

  @Column()
  channelId: number;

  @ManyToMany('User', 'roles')
  users: User[];

  @OneToMany('UserRolesRole', 'role')
  roleUsers: UserRolesRole[];

  get channel(): ChannelPromiseType {
    return { BatchChannel, LobbyChannel }[this.channelKind].findOne(
      this.channelId,
      { cache: true },
    );
  }

  get name(): Promise<string> {
    return Role.getName({ kind: this.kind, channel: this.channel });
  }

  static async getName({
    kind,
    channel,
  }: {
    kind: RoleKind;
    channel: ChannelPromiseType;
  }): Promise<string> {
    await channel;

    if (channel instanceof LobbyChannel)
      return `${kind}/${channel.courseCode}`.toUpperCase();

    if (channel instanceof BatchChannel)
      return `${kind}/${channel.name}`.toUpperCase();

    return '';
  }
}
