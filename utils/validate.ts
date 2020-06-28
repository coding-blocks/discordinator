import { validate as val } from 'class-validator';

export const validate = (Type, data) => val(Object.assign(new Type(), data));
