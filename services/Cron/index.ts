import * as cron from 'node-cron';
import { Worker } from '~/Workers';
import { SyncOneAuthUsers } from '~/Workers/SyncOneAuthUsers';
import { SyncDiscordUsers } from '~/Workers/SyncDiscordUsers';
import { SyncDiscordRoles } from '~/Workers/SyncDiscordRoles';

export class Cron {
  static Jobs: { [time: string]: typeof Worker[] } = {
    // every 5 seconds
    '*/5 * * * * *': [SyncDiscordRoles],

    // every minute
    '*/1 * * * *': [SyncDiscordRoles],

    // every 5 minutes
    '*/5 * * * *': [SyncDiscordUsers],

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
