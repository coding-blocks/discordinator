import { JsonController, Get, CookieParam } from 'routing-controllers';
import { OneAuth } from '~/services/OneAuth';
import { User, UserIdKind } from '~/entity/User';

@JsonController('/me')
export class MeController {
  @Get('/')
  async getOne(@CookieParam('oneauth') accessToken?: string) {
    const profile = accessToken && (await new OneAuth(accessToken).me());
    if (!profile) return {};

    const user = await User.findById(profile.id, 'oneauthId');
    if (!user) return {};

    if (profile.userdiscord?.id && user.discordId === null) {
      user.setDiscordId(profile.userdiscord.id);
      await user.save();
    }

    return user;
  }
}
