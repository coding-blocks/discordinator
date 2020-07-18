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

  initialize = async () => {
    await this.client.login(config.discord.botToken);
    this.guild = await this.client.guilds.resolve(config.discord.guildId);
  };

  // Channel

  createChannel = (name: string) => this.guild.channels.create(name);

  // Role

  createRole = async (channelId: string, name: string, permissions: string[]) => {
    const role = await this.guild.roles.create({ data: { name } });
    const channel = await this.guild.channels.resolve(channelId);

    channel.overwritePermissions([{ id: role.id, allow: permissions }]);

    return role;
  };

  deleteRole = async (roleId: string) => {
    await (await this.guild.roles.resolve(roleId))?.delete();

    return { id: roleId };
  };

  // User

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

  addUser = async (userId: string, accessToken: string) =>
    (await this.guild.addMember(userId, { accessToken })).user;

  assignRole = async (userId: string, roleId: string) => {
    const user = await this.guild.members.resolve(userId);

    await user.edit({ roles: [...user.roles, roleId] });

    return { id: `${userId}:${roleId}` };
  };

  unassignRole = async (userId: string, roleId: string) => {
    const user = await this.guild.members.resolve(userId);

    await user.edit({ roles: [...user.roles, roleId] });

    return { id: `${userId}:${roleId}` };
  };
}

export const Discord = new DiscordService();
