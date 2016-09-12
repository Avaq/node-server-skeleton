import def from '../util/typedef';
import tcomb, {union} from 'tcomb';
import {Readable} from 'stream';
import {test} from 'sanctuary';
import {complement as not} from 'ramda';

//Extend tcomb default types.
const T = Object.create(tcomb);
export default T;

//between :: Number, Number -> Number -> Boolean
const between = (a, b) => x => x >= a && x <= b;

//is :: Function -> Any -> Boolean
const is = cons => x => x instanceof cons;

T.ResponseStatus = def('ResponseStatus', T.Integer, {
  'must be a value betwen 100 and 599': not(between(100, 599))
});

T.ResponseHeader = def('ResponseHeader', T.String, {
  'may only contain alphanumeric characters and dashes': test(/[^a-zA-Z0-9\-]/)
});

T.ReadableStream = def('ReadableStream', T.Any, {
  'is not an instance of ReadableStream': not(is(Readable))
});

T.ResponseBody = union([
  T.String, T.ReadableStream
], 'ResponseBody');
