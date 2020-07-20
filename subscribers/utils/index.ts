import { UpdateEvent } from 'typeorm';
import { BaseEntity } from '~/entity/concerns/BaseEntity';

export const didUpdate = <T extends BaseEntity>(event: UpdateEvent<T>, column: string): boolean =>
  !!event.updatedColumns.find(({ propertyName }) => propertyName === column);

export const onRemoveOrRestore = <T extends BaseEntity>(
  event: UpdateEvent<T>,
  onRemove: (entity: T) => any,
  onRestore: (entity: T) => any,
): any => {
  if (didUpdate<T>(event, 'deletedAt')) {
    console.log('updated deletedAt');
    if (!!event.entity.deletedAt) return onRemove(event.entity);

    return onRestore(event.entity);
  }
};
