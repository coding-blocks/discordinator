import {
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  EntitySubscriberInterface,
} from 'typeorm';
import { Sync } from '~/services/Sync';
import { UserRole } from '~/entity/UserRole';
import { onRemoveOrRestore } from '~/subscribers/utils';

@EventSubscriber()
export class UserRoleSubscriber implements EntitySubscriberInterface<UserRole> {
  listenTo() {
    return UserRole;
  }

  afterInsert({ entity }: InsertEvent<UserRole>) {
    Sync.assignRole(entity);
  }

  afterUpdate(event: UpdateEvent<UserRole>) {
    onRemoveOrRestore(
      event,
      (userRole) => Sync.unassignRole(userRole),
      (userRole) => Sync.assignRole(userRole),
    );
  }

  afterRemove({ entity }: RemoveEvent<UserRole>) {
    Sync.unassignRole(entity);
  }
}
