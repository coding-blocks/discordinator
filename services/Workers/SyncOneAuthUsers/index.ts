import { User } from '~/entity/User';
import { OneAuth } from '~/services/OneAuth';
import { Worker } from '~/services/Workers';

export class SyncOneAuthUsers extends Worker {
  name = 'SyncOneAuthUsers';

  async run() {
    const users = await User.findAllUnSynced<User>();

    return users.map(async (user) => {
      const profile = await OneAuth.getProfile(user.oneauthId);

      if (profile?.userdiscord) {
        const { id, refreshToken } = profile.userdiscord;
        await user.updateDiscord(id, refreshToken);
      }

      return user;
    });
  }
}
