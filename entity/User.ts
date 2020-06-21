import { Entity, Column, ManyToMany, OneToMany, Index } from 'typeorm';
import { Role } from './Role';
import { UserRolesRole } from './UserRolesRole';
import { DiscordEntity } from './concerns/DiscordEntity';

@Entity()
export class User extends DiscordEntity {
  @Index({ unique: true })
  @Column()
  oneauthId: number;

  @Index({ unique: true })
  @Column()
  amoebaId: number;

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
