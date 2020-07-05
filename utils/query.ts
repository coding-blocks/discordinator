export const query = (obj: Object): string =>
  `?${Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join('&')}`;
