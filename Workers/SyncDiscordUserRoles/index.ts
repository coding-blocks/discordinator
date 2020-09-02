import { Worker } from '~/Workers';
import { UserRole } from '~/entity/UserRole';
import { Sync } from '~/services/Sync';
import { OneAuth } from '~/services/OneAuth';

export class SyncDiscordUserRoles extends Worker {
  name = 'SyncDiscordUserRoles';

  async run() {
    const userRoles = await UserRole.findAllUnSynced<UserRole>();

    return userRoles.map(async (userRole) => {
      if (userRole.deleted) {
        return Sync.unassignRole(userRole);
      }

      return Sync.assignRole(userRole);
    });
  }
}
