import { JsonController, UseBefore } from 'routing-controllers';
import { AuthorizationMiddleware } from '~/middlewares/Authorization';

@JsonController('/')
@UseBefore(AuthorizationMiddleware)
export class IndexAPIController {}
