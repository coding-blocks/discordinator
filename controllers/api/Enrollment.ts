import { JsonController, BodyParam, Post, Delete, OnUndefined } from 'routing-controllers';
import { IsDefined, IsInt, IsString, IsNotEmpty } from 'class-validator';
import { NotFoundError } from '~/controllers/errors/NotFound';
import { User, UserIdKind } from '~/entity/User';
import { Role, RoleKind } from '~/entity/Role';
import { UserRole } from '~/entity/UserRole';
import { validate } from '~/utils/validate';
import { Channel, ChannelKind } from '~/entity/Channel';
import { In } from 'typeorm';

export class NewUserEnrollment {
  @IsDefined()
  @IsInt()
  oneauthId: string;
  @IsDefined()
  @IsInt()
  amoebaId: string;
}

export class OldUserEnrollment {
  @IsDefined()
  @IsInt()
  id: number;
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  kind: UserIdKind;
}

@JsonController('/api/enrollments')
export class EnrollmentController {
  @Post('/')
  @OnUndefined(NotFoundError)
  async post(
    @BodyParam('batch', { required: true })
    batch: { courseCode: string; courseKind: string; batchCode: string },
    @BodyParam('user', { required: true })
    enrollment: NewUserEnrollment | OldUserEnrollment,
  ) {
    const { courseKind, courseCode, batchCode } = batch;
    const channels = await Channel.find({
      where: [
        { kind: ChannelKind.LOBBY, courseCode },
        { kind: ChannelKind.BATCH, courseKind, courseCode, batchCode },
      ],
    });
    if (!channels.length) return;

    const studentRoles = await Role.find({
      where: { kind: RoleKind.STUDENT, channel: In(channels.map((channel) => channel.id)) },
      relations: ['channel'],
    });

    let user;
    if (!(await validate(NewUserEnrollment, enrollment)).length) {
      const { oneauthId, amoebaId } = enrollment as NewUserEnrollment;

      user =
        (await User.find({ where: { oneauthId, amoebaId } }))[0] ||
        (await new User({ oneauthId, amoebaId }).save());
    } else if (!(await validate(OldUserEnrollment, enrollment)).length) {
      const { id, kind } = enrollment as OldUserEnrollment;
      user = await User.findById(id, kind);
    } else {
      return;
    }
    if (!user) return;

    const roles = await Promise.all(
      studentRoles.map((role) =>
        UserRole.findOrCreateAndRestore({ where: { user, role } }, { user, role }),
      ),
    );

    return { channels, roles, user };
  }
}
