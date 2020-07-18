import {
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  EntitySubscriberInterface,
} from 'typeorm';
import { Sync } from '~/services/Sync';
import { Role } from '~/entity/Role';

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<Role> {
  listenTo() {
    return Role;
  }

  afterInsert(event: InsertEvent<Role>) {
    Sync.addRole(event.entity);
  }

  afterRemove(event: RemoveEvent<Role>) {
    Sync.removeRole(event.entity);
  }
}
