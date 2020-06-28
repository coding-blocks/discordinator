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
import { UserRole } from '~/entity/UserRole';
import { Role, RoleKind } from '~/entity/Role';
import { NotFoundError } from './errors/NotFound';
import { belongsToEnum } from '~/utils/belongsToEnum';
import { Channel, ChannelKind } from '~/entity/Channel';

@JsonController('/roles')
export class RoleController {
  @Get('/')
  getAll(
    @QueryParam('skip') skip?: number,
    @QueryParam('take') take?: number,
    @QueryParam('kind') kind?: RoleKind,
  ) {
    const where: { kind?: RoleKind } = {};
    if (belongsToEnum(RoleKind, kind)) where.kind = kind;

    return Role.paginate({ skip, take, where });
  }

  @Get('/:id')
  @OnUndefined(NotFoundError)
  async getOne(@Param('id') id: number) {
    const role = await Role.findOne(id);

    return role && { role };
  }

  @Get('/:id/users')
  @OnUndefined(NotFoundError)
  async getUsers(
    @Param('id') id: number,
    @QueryParam('take') take?: number,
    @QueryParam('skip') skip?: number,
  ) {
    const role = await Role.findOne(id);
    if (!role) return;

    const { results, ...data } = await UserRole.paginate({
      skip,
      take,
      where: {
        role,
      },
      relations: ['user'],
    });

    return { ...data, users: results.userRoles.map(({ user }) => user) };
  }

  @Post('/')
  @OnUndefined(NotFoundError)
  async post(@Body() body: Role) {
    const { kind, channelId } = body;
    const channel = await Channel.findOne(channelId);

    if (!channel) return;

    return {
      role: await new Role({
        kind,
        channel,
      }).save(),
    };
  }
}
