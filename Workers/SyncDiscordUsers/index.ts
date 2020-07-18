import { Worker } from '~/Workers';
import { User } from '~/entity/User';
import { Sync } from '~/services/Sync';
import { OneAuth } from '~/services/OneAuth';

export class SyncDiscordUsers extends Worker {
  name = 'SyncDiscordUsers';

  async run() {
    const users = await User.findAllUnSynced<User>();

    return users.map(async (user) => {
      if (user.deleted) {
        // TODO(naman): Remove user flow
        return;
      }

      return Sync.addUser(user);
    });
  }
}
