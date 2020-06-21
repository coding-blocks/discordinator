import { Entity, Column, Index } from 'typeorm';
import { IDiscordEntity } from '~/types';
import { Channel } from './concerns/Channel';

@Entity()
@Index(['courseCode', 'courseType', 'batchCode'], { unique: true })
export class BatchChannel extends Channel implements IDiscordEntity {
  @Column()
  courseType: string;

  @Column()
  batchCode: string;

  get name(): string {
    return BatchChannel.getName({
      courseType: this.courseType,
      courseCode: this.courseCode,
      batchCode: this.batchCode,
    });
  }

  static getName({
    courseType,
    courseCode,
    batchCode,
  }: {
    courseType: string;
    courseCode: string;
    batchCode: string;
  }): string {
    return `${courseType}${courseCode}${batchCode}`.toUpperCase();
  }
}
