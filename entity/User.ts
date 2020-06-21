import { Entity, Column, ManyToMany, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './concerns/BaseEntity';
import { IDiscordEntity } from '~/types';
import { Role } from './Role';
import { UserRolesRole } from './UserRolesRole';

@Entity()
export class User extends BaseEntity implements IDiscordEntity {
  @Index({ unique: true })
  @Column()
  oneauthId: number;

  @Index({ unique: true })
  @Column()
  amoebaId: number;

  @Index({ unique: true })
  @Column()
  discordId: string;

  @ManyToMany('Role', 'users', {
    cascade: true,
  })
  roles: Role[];

  @OneToMany('UserRolesRole', 'user')
  userRoles: UserRolesRole[];

  get name(): string {
    return '';
  }
}
