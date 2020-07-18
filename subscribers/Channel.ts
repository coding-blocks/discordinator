import { EventSubscriber, InsertEvent, UpdateEvent, EntitySubscriberInterface } from 'typeorm';
import { Channel } from '~/entity/Channel';
import { Sync } from '~/services/Sync';

@EventSubscriber()
export class ChannelSubscriber implements EntitySubscriberInterface<Channel> {
  listenTo() {
    return Channel;
  }

  afterInsert(event: InsertEvent<Channel>) {
    Sync.addChannel(event.entity);
  }
}
