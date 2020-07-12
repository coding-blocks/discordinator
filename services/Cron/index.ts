import * as cron from 'node-cron';
import { Worker } from '~/services/Workers';
import { SyncOneAuthUser } from '~/services/Workers/SyncOneAuthUser';

export class Cron {
  static Jobs: { [time: string]: typeof Worker[] } = {
    // every minute
    '1 * * * * *': [SyncOneAuthUser],

    // every 5 minutes
    '* 5 * * * *': [],

    // every 10 minutes
    '* 10 * * * *': [],

    // every 30 minutes
    '* 30 * * * *': [],

    // every hour
    '* * 1 * * *': [],

    // every day
    '* * * 1 * *': [],
  };

  static initialize() {
    Object.keys(Cron.Jobs).forEach((scheduledAt) => {
      cron.schedule(scheduledAt, () =>
        Cron.Jobs[scheduledAt].forEach(async (job) => job.perform()),
      );
    });
  }
}
