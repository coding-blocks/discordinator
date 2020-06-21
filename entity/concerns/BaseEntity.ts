import {
  BaseEntity as Base,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity extends Base {
  constructor(props?: { [key: string]: any }) {
    super();
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  set(props: { [key: string]: any }): void {
    Object.assign(this, props);
  }
}
