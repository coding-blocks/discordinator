import { JsonController, Get, CookieParam } from 'routing-controllers';
import { OneAuth } from '~/services/OneAuth';
import { User, UserIdKind } from '~/entity/User';

@JsonController('/me')
export class MeController {
  @Get('/')
  async getOne(@CookieParam('oneauth') accessCookie?: string) {
    const profile = accessCookie && (await new OneAuth({ accessCookie }).me());
    if (!profile) return { user: null };

    const user = await User.findById(profile.id, 'oneauthId');
    if (!user) return { user: null };

    return { user };
  }
}
