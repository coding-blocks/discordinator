import {
  Entity,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Role } from './Role';
import { User } from './User';

@Entity()
export class UserRolesRole {
  @PrimaryColumn({ type: 'integer', name: 'userId' })
  @ManyToOne('User', 'userRoles')
  @JoinColumn()
  user: User;

  @PrimaryColumn({ type: 'integer', name: 'roleId' })
  @ManyToOne('Role', 'roleUsers')
  @JoinColumn()
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
