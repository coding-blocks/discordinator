export const useMiddeware = (
  middleware: any,
): ((req: any, res: any, next: (err?: any) => any) => void) => (
  req: any,
  res: any,
  next: (err?: any) => any,
): void => new middleware().use(req, res, next);
