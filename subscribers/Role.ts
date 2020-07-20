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

  afterInsert({ entity }: InsertEvent<Role>) {
    Sync.addRole(entity);
  }
}
