import {struct} from 'tcomb';
import T from './types';

//An example model.
export const Example = struct({
  status: T.ResponseStatus,
  message: T.String
}, 'Example');
