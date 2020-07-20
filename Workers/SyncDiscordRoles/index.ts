import { Worker } from '~/Workers';
import { Role } from '~/entity/Role';
import { Sync } from '~/services/Sync';
import { OneAuth } from '~/services/OneAuth';

export class SyncDiscordRoles extends Worker {
  name = 'SyncDiscordRoles';

  async run() {
    const roles = await Role.findAllUnSynced<Role>();

    return roles.map(async (role) => {
      if (role.deleted) {
        // TODO(naman): Remove role flow
        return;
      }

      return Sync.addRole(role);
    });
  }
}
