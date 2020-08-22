import {
  BaseEntity as Base,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  FindManyOptions,
  FindOneOptions,
  DeepPartial,
} from 'typeorm';
import { plural } from 'pluralize';
import { ObjectType } from '~/types';
import { camelCase } from 'camel-case';
import { snakeCase } from 'snake-case';
import { IsDefined, IsInt, Min, IsDate, IsOptional } from 'class-validator';

export interface IPaginateOptions<T extends Base> extends FindManyOptions<T> {
  maxItems?: number;
}

export interface IPaginateResult<T extends Base> {
  total: number;
  skipped: number;
  results: {
    [results: string]: T[];
  };
}

export const DEFAULT_PAGINATION_LIMIT = 10;

export abstract class BaseEntity extends Base {
  constructor(props?: { [key: string]: any }) {
    super();
    if (props) Object.assign(this, props);
  }

  @CreateDateColumn()
  @IsDate()
  @IsOptional()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @IsOptional()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsDate()
  @IsOptional()
  deletedAt: Date;

  set(props: { [key: string]: any }): void {
    Object.assign(this, props);
  }

  // NOTE(naman): repository.softDelete does not emit UpdateEvent
  async softDelete(): Promise<any> {
    if (!!this.deletedAt) return Promise.resolve();
    this.deletedAt = new Date();
    return await this.save();
  }

  // NOTE(naman): repository.restore does not emit UpdateEvent
  async restore(): Promise<any> {
    if (!this.deletedAt) return Promise.resolve();
    this.deletedAt = null;
    return await this.save();
  }

  static async paginate<T extends Base>(
    this: ObjectType<T>,
    options: IPaginateOptions<T> = {},
  ): Promise<IPaginateResult<T>> {
    const { maxItems = DEFAULT_PAGINATION_LIMIT, take = maxItems, skip = 0, ...query } = options;

    const [results, total] = await (this as any).getRepository().findAndCount({
      take: Math.max(take, 0),
      skip,
      ...(options as object),
      // NOTE(naman): without where prop, take and skip will be taken as columns
      where: {
        ...((options.where as object) || {}),
      },
    });

    return {
      results: { [camelCase(plural(snakeCase(this.name).toLowerCase()))]: results },
      total,
      skipped: skip,
    };
  }

  static async findOrCreateAndRestore<T extends BaseEntity>(
    this: ObjectType<T>,
    findOptions: FindManyOptions<T>,
    data: DeepPartial<T>,
  ) {
    const entity =
      (await (this as any).find(findOptions))[0] || (await new (this as any)(data).save());
    await entity.restore();

    return entity;
  }
}
