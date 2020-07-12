import { JsonController, Get, Redirect, QueryParam, CookieParam } from 'routing-controllers';
import { OneAuth } from '~/services/OneAuth';
import { User, UserIdKind } from '~/entity/User';
import config from '~/config';

class SessionManager {
  #store = new Map();

  save(id: number, returnTo: string) {
    clearTimeout(this.#store.get(id)?.timeout);

    this.#store.set(id, { returnTo, timeout: setTimeout(() => this.#store.delete(id), 1000 * 60) });
  }

  get(id: number) {
    const session = this.#store.get(id);

    clearTimeout(session?.timeout);
    this.#store.delete(id);

    return session;
  }
}

const sessions = new SessionManager();

@JsonController('/connect')
export class ConnectController {
  private onSuccessRedirect: string = config.oneauth.url;

  @Get('/')
  @Redirect(config.oneauth.url)
  async connect(
    @CookieParam('oneauth') accessCookie?: string,
    @QueryParam('returnTo') returnTo?: string,
  ) {
    const oneAuthUser = accessCookie && (await new OneAuth({ accessCookie }).me());
    if (!oneAuthUser) return OneAuth.login();

    const profile = await OneAuth.getProfile(oneAuthUser.id);

    const session = sessions.get(profile.id);
    const redirect = returnTo || session?.returnTo;

    if (!profile.userdiscord?.id) {
      sessions.save(profile.id, redirect);
      return OneAuth.connect();
    }

    const user = await User.findById(profile.id, 'oneauthId');
    if (!user) return redirect;

    if (!user.discordId) {
      const { id, refreshToken } = profile.userdiscord;
      await user.updateDiscord(id, refreshToken);
    }

    return redirect;
  }

  @Get('/login')
  @Redirect('')
  login(): string {
    return OneAuth.login();
  }

  @Get('/callback')
  @Redirect(config.oneauth.url)
  async callback(@QueryParam('code') code: string): Promise<string> {
    const profile = code && (await OneAuth.verifyLogin(code));
    if (!profile) return OneAuth.login();

    const user = await User.findById(profile.id, 'oneauthId');
    if (!user) return sessions.get(profile.id)?.returnTo;

    if (!profile.userdiscord?.id) return OneAuth.connect();

    if (!user.discordId) {
      const { id, refreshToken } = profile.userdiscord;
      await user.updateDiscord(id, refreshToken);
    }

    return sessions.get(profile.id)?.returnTo;
  }
}
