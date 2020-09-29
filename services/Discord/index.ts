import config from '~/config';
import axios from 'axios';
import * as fetch from 'node-fetch';
import * as FormData from 'form-data';
import { OneAuth } from '~/services/OneAuth';
import { allowedPermissions } from './utils';

const SDK = require('discord.js');

class DiscordService {
  private client: any;
  private guild: any;

  constructor() {
    this.client = new SDK.Client();
  }

  initialize = async () => await this.client.login(config.discord.botToken);

  async getGuild() {
    return this.client.guilds.resolve(config.discord.guildId);
  }

  // Channel

  createChannel = async (name: string, options?: { parent?: string }) =>
    (await this.getGuild()).channels.create(name, options);

  // Role

  createRole = async (channelId: string, name: string, permissions: string[]) => {
    const guild = await this.getGuild();
    const role = await guild.roles.create({ data: { name } });
    const channel = await guild.channels.resolve(channelId);

    await channel.createOverwrite(role.id, allowedPermissions(permissions));
    return role;
  };

  deleteRole = async (roleId: string) => {
    await (await (await this.getGuild()).roles.resolve(roleId))?.delete();

    return { id: roleId };
  };

  // User

  addUser = async (userId: string, accessToken: string) =>
    (await (await this.getGuild()).addMember(userId, { accessToken })).user;

  assignRole = async (userId: string, roleId: string) => {
    const user = await (await this.getGuild()).members.resolve(userId);
    if (!user) return null;

    await user.roles.add(roleId);

    return { id: `${userId}:${roleId}` };
  };

  unassignRole = async (userId: string, roleId: string) => {
    const user = await (await this.getGuild()).members.resolve(userId);
    if (!user) return null;

    await user.roles.remove(roleId);

    return { id: `${userId}:${roleId}` };
  };

  getAccessToken = async (
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string } | null> => {
    const body = new FormData();
    const data = {
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: 'http://example.com',
      scope: config.discord.scopes.join(' '),
    };

    Object.keys(data).forEach((key) => body.append(key, data[key]));

    try {
      const res = await fetch('https://discord.com/api/v6/oauth2/token', {
        method: 'post',
        body,
      });

      if (res.ok) return await res.json();

      return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
}

export const Discord = new DiscordService();
