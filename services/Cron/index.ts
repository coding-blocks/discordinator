import * as cron from 'node-cron';
import { Worker } from '~/services/Workers';
import { SyncOneAuthUsers } from '~/services/Workers/SyncOneAuthUsers';

export class Cron {
  static Jobs: { [time: string]: typeof Worker[] } = {
    // every minute
    '*/1 * * * *': [SyncOneAuthUsers],

    // every 5 minutes
    '*/5 * * * *': [],
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
