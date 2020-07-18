import { IsNull } from 'typeorm';
import { Worker } from '~/Workers';
import { User } from '~/entity/User';
import { OneAuth } from '~/services/OneAuth';

export class SyncOneAuthUsers extends Worker {
  name = 'SyncOneAuthUsers';

  async run() {
    const users = await User.find({ where: [{ discordId: IsNull() }, { refreshToken: IsNull() }] });

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
