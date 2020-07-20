import { User } from '~/entity/User';
import { Channel } from '~/entity/Channel';
import { Discord } from '~/services/Discord';
import { UserRole } from '~/entity/UserRole';
import { Role, RolePermissions } from '~/entity/Role';

export type SyncResult = Promise<boolean>;

export class Sync {
  // Channel

  static addChannel = async (channel: Channel): SyncResult =>
    channel.sync<Channel>(() => Discord.createChannel(channel.name));

  // Role

  static addRole = async (role: Role): SyncResult => {
    const channel = role.channel || (await Channel.findOne(role.channelId));

    return (
      channel &&
      !!channel.synced &&
      role.sync<Role>(() =>
        Discord.createRole(channel.discordId, role.name, RolePermissions[role.kind]),
      )
    );
  };

  static removeRole = async (role: Role): SyncResult =>
    role.sync<Role>(() => Discord.deleteRole(role.discordId));

  // User

  static addUser = async (user: User): SyncResult =>
    user.sync<User>(async () => {
      const accessTokenResult = await Discord.getAccessToken(user.refreshToken);
      if (!accessTokenResult) return;

      const { access_token, refresh_token } = accessTokenResult;
      user.refreshToken = refresh_token;
      await user.save();

      const res = await Discord.addUser(user.discordId, access_token);
      return res;
    });

  // User Role

  static assignRole = async (userRole: UserRole): SyncResult =>
    userRole.role.synced &&
    userRole.user.synced &&
    userRole.sync<UserRole>(() =>
      Discord.assignRole(userRole.user.discordId, userRole.role.discordId),
    );

  static unassignRole = async (userRole: UserRole): SyncResult =>
    userRole.role.synced &&
    userRole.user.synced &&
    userRole.sync<UserRole>(() =>
      Discord.unassignRole(userRole.user.discordId, userRole.role.discordId),
    );
}
