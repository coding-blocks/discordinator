import { User } from '~/entity/User';
import { Sync } from '~/services/Sync';
import { EventSubscriber, InsertEvent, UpdateEvent, EntitySubscriberInterface } from 'typeorm';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    this.addUser(event.entity);
  }

  afterUpdate(event: UpdateEvent<User>) {
    if (event.updatedColumns.find(({ propertyName }) => propertyName === 'discordId'))
      this.addUser(event.entity);
  }

  private addUser(user: User) {
    if (!user.synced && !!user.discordId) {
      Sync.addUser(user);
    }
  }
}
