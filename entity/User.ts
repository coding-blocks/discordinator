import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  Index,
  JoinTable,
  FindManyOptions,
} from 'typeorm';
import { Role } from './Role';
import * as moment from 'moment';
import { UserRole } from './UserRole';
import { DiscordEntity } from './concerns/DiscordEntity';
import { IsDefined, IsOptional, IsInt, IsString, Min } from 'class-validator';

export type UserIdKind = 'id' | 'oneauthId' | 'amoebaId';

@Entity()
export class User extends DiscordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @IsDefined()
  @IsInt()
  @Min(0)
  oneauthId: number;

  @Index({ unique: true })
  @Column()
  @IsDefined()
  @IsInt()
  @Min(0)
  amoebaId: number;

  @Column({ nullable: true })
  @IsString()
  @Min(0)
  @IsOptional()
  refreshToken: string;

  @ManyToMany('Role', 'users', {
    cascade: true,
  })
  @JoinTable({
    name: 'user_role',
  })
  roles: Role[];

  @OneToMany('UserRole', 'user', { onDelete: 'CASCADE' })
  userRoles: UserRole[];

  getName(): string {
    return '';
  }

  setDiscordId(value: string) {
    const now = new Date(moment().utc().format());

    this.discordId = value;
    this.discordSyncedAt = now;
    this.discordSyncTriedAt = now;
  }

  async updateDiscordId(value?: string): Promise<void> {
    if (!!value && this.discordId !== value) {
      this.setDiscordId(value);
      await this.save();
    }
  }

  static async findById(id: number, kind: UserIdKind = 'id', options: FindManyOptions<User> = {}) {
    if (!['id', 'oneauthId', 'amoebaId'].includes(kind)) return;

    return (
      await this.getRepository().find({
        ...(options as object),
        where: {
          [kind]: id,
          ...((options.where as object) || {}),
        },
      })
    )[0];
  }
}
