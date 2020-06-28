export const belongsToEnum = (Enum: object, value: any): boolean =>
  Object.values(Enum).includes(value);
