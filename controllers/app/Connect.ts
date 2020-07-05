import { JsonController, Get, Redirect, QueryParam, Param } from 'routing-controllers';
import { OneAuth } from '~/services/OneAuth';
import { User, UserIdKind } from '~/entity/User';
import config from '~/config';

@JsonController('/connect')
export class ConnectController {
  private onSuccessRedirect: string = config.oneauth.url;

  @Get('/')
  @Redirect('/404')
  login(): string {
    return OneAuth.login();
  }

  @Get('/callback')
  @Redirect('/404')
  async callback(@QueryParam('code') code: string): Promise<string> {
    const profile = code && (await OneAuth.verifyLogin(code));
    if (!profile) return OneAuth.login();

    const user = await User.findById(profile.id, 'oneauthId');
    if (!user) return;

    if (!profile.userdiscord?.id) return OneAuth.connect(profile.id);

    await user.updateDiscordId(profile.userdiscord?.id);

    return this.onSuccessRedirect;
  }

  @Get('/success/:oneauthId')
  @Redirect('/404')
  async success(@Param('oneauthId') oneauthId: number): Promise<string> {
    const user = await User.findById(oneauthId, 'oneauthId');
    if (!user) return;

    const profile = await OneAuth.getProfile(oneauthId);
    if (!profile || !profile.userdiscord) return;

    await user.updateDiscordId(profile.userdiscord.id);

    return this.onSuccessRedirect;
  }
}
