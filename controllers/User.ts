import {
  JsonController,
  Param,
  QueryParam,
  Body,
  BodyParam,
  Get,
  Post,
  Delete,
  OnUndefined,
} from 'routing-controllers';
import { NotFoundError } from './errors/NotFound';
import { User, UserIdKind } from '~/entity/User';
import { UserRole } from '~/entity/UserRole';
import { Role } from '~/entity/Role';

@JsonController('/users')
export class UserController {
  @Get('/')
  getAll(@QueryParam('skip') skip?: number, @QueryParam('take') take?: number) {
    return User.paginate({ skip, take });
  }

  @Get('/:id')
  @OnUndefined(NotFoundError)
  async getOne(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind);

    return user && { user };
  }

  @Get('/:id/roles')
  @OnUndefined(NotFoundError)
  async getRoles(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind, { relations: ['roles'] });

    return user && { roles: user.roles };
  }

  @Get('/:id/channels')
  @OnUndefined(NotFoundError)
  async getChannels(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind, { relations: ['roles'] });

    return user && { channels: user.roles.map(({ channel }) => channel) };
  }

  @Post('/')
  async post(@Body() body: User) {
    const { oneauthId, amoebaId } = body;

    return {
      user: await new User({
        oneauthId,
        amoebaId,
      }).save(),
    };
  }

  @Post('/:id/roles')
  @OnUndefined(NotFoundError)
  async postRole(@Param('id') id: number, @BodyParam('roleId', { required: true }) roleId: number) {
    const user = await User.findOne(id);
    if (!user) return;

    const role = await Role.findOne(roleId);
    if (!role) return;

    const userRole = await new UserRole({ user, role }).save();

    return { userRole };
  }
}
