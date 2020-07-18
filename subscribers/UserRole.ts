import {
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  EntitySubscriberInterface,
} from 'typeorm';
import { Sync } from '~/services/Sync';
import { UserRole } from '~/entity/UserRole';

@EventSubscriber()
export class UserRoleSubscriber implements EntitySubscriberInterface<UserRole> {
  listenTo() {
    return UserRole;
  }

  afterInsert(event: InsertEvent<UserRole>) {
    Sync.assignRole(event.entity);
  }

  afterRemove(event: RemoveEvent<UserRole>) {
    Sync.unassignRole(event.entity);
  }
}
