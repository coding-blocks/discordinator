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
import { IsNull } from 'typeorm';
import { NotFoundError } from '~/controllers/errors/NotFound';
import { User, UserIdKind } from '~/entity/User';
import { UserRole } from '~/entity/UserRole';
import { Role } from '~/entity/Role';

@JsonController('/api/users')
export class UserController {
  @Get('/')
  getAll(@QueryParam('skip') skip?: number, @QueryParam('take') take?: number) {
    return User.paginate({ skip, take });
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

  @Get('/:id')
  @OnUndefined(NotFoundError)
  async getOne(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind);

    return user && { user };
  }

  @Get('/:id/roles')
  @OnUndefined(NotFoundError)
  async getRoles(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind);
    if (!user) return;

    const roles = await UserRole.find({ where: { user, deletedAt: IsNull() } });

    return { roles };
  }

  @Delete('/:userId/roles/:roleId')
  @OnUndefined(NotFoundError)
  async deleteRole(
    @Param('userId') userId: number,
    @Param('roleId') roleId: number,
    @QueryParam('user_id_type') userIdKind?: UserIdKind,
  ) {
    const [user, role] = await Promise.all([
      User.findById(userId, userIdKind),
      Role.findOne(roleId),
    ]);
    if (!user || !role) return;

    const [userRole] = await UserRole.find({ user, role, deletedAt: IsNull() });
    if (!userRole) return;

    await userRole.softDelete();

    return { role: userRole };
  }

  @Post('/:id/roles')
  @OnUndefined(NotFoundError)
  async postRole(@Param('id') id: number, @BodyParam('roleId', { required: true }) roleId: number) {
    const user = await User.findOne(id);
    if (!user) return;

    const role = await Role.findOne(roleId);
    if (!role) return;

    const userRole = await new UserRole({ user, role }).save();
    await userRole.restore();

    return { userRole };
  }

  @Get('/:id/channels')
  @OnUndefined(NotFoundError)
  async getChannels(@Param('id') id: number, @QueryParam('id_type') kind?: UserIdKind) {
    const user = await User.findById(id, kind, { relations: ['roles'] });

    return user && { channels: user.roles.map(({ channel }) => channel) };
  }
}
