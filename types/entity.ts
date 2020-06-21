import { BatchChannel } from '~/entity/BatchChannel';
import { LobbyChannel } from '~/entity/LobbyChannel';

export enum RoleKind {
  STUDENT = 'Student',
  ASSISTANT = 'Assistant',
}

export enum ChannelKind {
  BATCH = 'BatchChannel',
  LOBBY = 'LobbyChannel',
}

export interface IDiscordEntity {
  discordId: string;
  name: Promise<string> | string;
}

export type ChannelType = BatchChannel | LobbyChannel;

export type ChannelPromiseType = Promise<ChannelType> | ChannelType;
