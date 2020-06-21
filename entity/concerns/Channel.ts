import { Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Role } from '~/entity/Role';
import { IDiscordEntity } from '~/types';

export abstract class Channel extends BaseEntity implements IDiscordEntity {
  @Index({ unique: true })
  @Column()
  discordId: string;

  @Column()
  courseCode: string;

  @OneToMany('Role', 'channel')
  roles: Role[];

  abstract get name(): string;
}
