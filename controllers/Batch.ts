import { JsonController, Body, Post, Delete, OnUndefined } from 'routing-controllers';
import { Role, RoleKind } from '~/entity/Role';
import { Channel, ChannelKind } from '~/entity/Channel';

@JsonController('/batches')
export class BatchController {
  @Post('/')
  async post(@Body() body: { courseCode: string; courseKind: string; batchCode: string }) {
    const { courseKind, courseCode, batchCode } = body;

    const channels = await Promise.all(
      Object.values(ChannelKind).map(async (kind) => {
        const channel = new Channel({
          kind,
          courseKind,
          courseCode,
          batchCode,
          roles: Object.values(RoleKind).map((roleKind) => new Role({ kind: roleKind })),
        });

        await channel.save();

        channel.roles.forEach((role) => (role.name = Role.getName({ kind: role.kind, channel })));
        channel.setName();

        return channel;
      }),
    );

    return { channels };
  }
}
