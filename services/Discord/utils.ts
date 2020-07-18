export const allowedPermissions = (permissions: string[]): { [flag: string]: boolean } =>
  permissions.reduce(
    (h, flag) => ({
      ...h,
      [flag]: true,
    }),
    {},
  );
