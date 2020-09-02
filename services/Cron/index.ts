import * as cron from 'node-cron';
import { Worker } from '~/Workers';
import { SyncOneAuthUsers } from '~/Workers/SyncOneAuthUsers';
import { SyncDiscordUsers } from '~/Workers/SyncDiscordUsers';
import { SyncDiscordRoles } from '~/Workers/SyncDiscordRoles';
import { SyncDiscordUserRoles } from '~/Workers/SyncDiscordUserRoles';

export class Cron {
  static Jobs: { [time: string]: typeof Worker[] } = {
    // every 5 seconds
    '*/5 * * * * *': [SyncDiscordUsers, SyncDiscordRoles, SyncDiscordUserRoles],

    // every 10 minutes
    '*/10 * * * *': [SyncOneAuthUsers],
  };

  static initialize() {
    console.log('Setting up cron jobs.');
    Object.keys(Cron.Jobs).forEach((scheduledAt) => {
      cron.schedule(scheduledAt, () =>
        Cron.Jobs[scheduledAt].forEach(async (job) => job.perform()),
      );
    });
  }
}
