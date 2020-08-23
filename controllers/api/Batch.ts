import { JsonController, Body, Post, Delete, OnUndefined } from 'routing-controllers';
import { Role, RoleKind } from '~/entity/Role';
import { Channel, ChannelKind } from '~/entity/Channel';

@JsonController('/api/batches')
export class BatchController {
  @Post('/')
  async post(@Body() body: { courseCode: string; courseKind: string; batchCode: string }) {
    const { courseKind, courseCode, batchCode } = body;

    const createLobbyChannel = async (): Promise<Channel> =>
      Channel.findOrCreateAndRestore(
        { where: { kind: ChannelKind.LOBBY, courseCode }, relations: ['roles'] },
        {
          kind: ChannelKind.LOBBY,
          courseCode,
          roles: Object.values(RoleKind).map((roleKind) => new Role({ kind: roleKind })),
        },
      );

    const createBatchChannel = async (): Promise<Channel> =>
      Channel.findOrCreateAndRestore(
        {
          where: { kind: ChannelKind.BATCH, courseKind, courseCode, batchCode },
          relations: ['roles'],
        },
        {
          kind: ChannelKind.BATCH,
          courseKind,
          courseCode,
          batchCode,
          roles: Object.values(RoleKind).map((roleKind) => new Role({ kind: roleKind })),
        },
      );

    const channels = await Promise.all(
      [await createLobbyChannel(), await createBatchChannel()].map(async (channel) => {
        await channel;
        channel.setName();
        channel.roles.forEach((role) => (role.name = Role.getName({ kind: role.kind, channel })));

        return channel;
      }),
    );

    return { channels };
  }
}
