import {
  BaseEntity as Base,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  FindManyOptions,
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

  @DeleteDateColumn()
  @IsDate()
  @IsOptional()
  deletedAt: Date;

  set(props: { [key: string]: any }): void {
    Object.assign(this, props);
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
}
