import { JsonController, UseBefore } from 'routing-controllers';
import { AuthorizationMiddleware } from '~/middlewares/Authorization';

@JsonController('/api')
@UseBefore(AuthorizationMiddleware)
export class IndexAPIController {}
