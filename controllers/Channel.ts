import {
  JsonController,
  Param,
  QueryParam,
  QueryParams,
  Body,
  Get,
  Post,
  Delete,
  OnUndefined,
} from 'routing-controllers';
import { User } from '~/entity/User';
import { FindManyOptions } from 'typeorm';
import { Role, RoleKind } from '~/entity/Role';
import { NotFoundError } from './errors/NotFound';
import { belongsToEnum } from '~/utils/belongsToEnum';
import { Channel, ChannelKind } from '~/entity/Channel';
import { DEFAULT_PAGINATION_LIMIT } from '~/entity/concerns/BaseEntity';

@JsonController('/channels')
export class ChannelController {
  @Get('/')
  getAll(
    @QueryParams()
    query: {
      courseKind?: string;
      courseCode?: string;
      batchCode?: string;
      kind?: ChannelKind;
    },
    @QueryParam('skip') skip?: number,
    @QueryParam('take') take?: number,
  ) {
    const where: {
      [column: string]: string;
    } = ['courseKind', 'courseCode', 'batchCode'].reduce(
      (clause, param) => {
        if (query[param]) clause[param] = query[param];

        return clause;
      },
      belongsToEnum(ChannelKind, query.kind) ? { kind: query.kind } : {},
    );

    return Channel.paginate({ skip, take, where });
  }

  @Get('/:id')
  @OnUndefined(NotFoundError)
  async getOne(@Param('id') id: number) {
    const channel = await Channel.findOne(id);

    return channel && { channel };
  }

  @Get('/:id/roles')
  @OnUndefined(NotFoundError)
  async getRoles(@Param('id') id: number) {
    const channel = await Channel.findOne(id, { relations: ['roles'] });

    return channel && { roles: channel.roles };
  }

  @Get('/:id/users')
  @OnUndefined(NotFoundError)
  async getUsers(
    @Param('id') id: number,
    @QueryParam('take') take: number = DEFAULT_PAGINATION_LIMIT,
    @QueryParam('skip') skip = 0,
  ) {
    const baseQuery = Channel.getRepository()
      .createQueryBuilder()
      .from(Channel, 'channel')
      .where('channel.id = :id', { id })
      .innerJoin('channel.roles', 'role')
      .innerJoin('role.users', 'user')
      .distinctOn(['user.id'])
      .groupBy('user.id');

    const taken = Math.max(take, 0);
    const skipped = Math.max(skip, 0);

    return {
      skipped,
      total: Number((await baseQuery.select('COUNT(user.id)').getRawOne())?.count) || 0,
      users: await baseQuery
        .select(
          User.getRepository()
            .metadata.columns.map(
              (column) => `"user"."${column.databaseName}" AS "${column.propertyName}"`,
            )
            .join(', '),
        )
        .limit(taken)
        .offset(skipped)
        .getRawMany(),
    };
  }

  @Post('/')
  async post(@Body() body: Channel) {
    const { kind, courseKind, courseCode, batchCode } = body;

    const channel = await new Channel({
      kind,
      courseKind,
      courseCode,
      batchCode,
    }).save();

    return { channel };
  }
}
