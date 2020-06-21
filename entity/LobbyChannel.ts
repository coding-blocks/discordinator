import { Entity, Index } from 'typeorm';
import { IDiscordEntity } from '~/types';
import { Channel } from './concerns/Channel';

@Entity()
@Index(['courseCode'], { unique: true })
export class LobbyChannel extends Channel implements IDiscordEntity {
  get name(): string {
    return LobbyChannel.getName({ courseCode: this.courseCode });
  }

  static getName({ courseCode }: { courseCode: string }): string {
    return `lobby-${courseCode}`.toUpperCase();
  }
}
