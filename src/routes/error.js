/*eslint no-unused-vars:0, complexity:0, no-console:0*/
import createError from 'http-errors';
import {line, getErrorString} from '../util/common';
import {log} from 'util';

const toJSON = err => (
  typeof err.toJSON === 'function'
  ? err.toJSON(err)
  : err.expose || process.env.NODE_ENV !== 'production'
  ? err instanceof Error && err.message && err.name
  ? Object.assign({name: err.name, message: err.message}, err)
  : {name: 'Error', message: err.message || err.toString()}
  : {name: err.name || 'Error', message: 'A super secret error occurred'}
);

export default router => {

  //Stacks that reach to here are 404.
  router.all('*', (req, res, next) => next(createError(404, line `
    There's nothing at ${req.method.toUpperCase()} ${req.path}
  `)));

  //Log errors.
  router.use((err, req, res, next) => {

    if(!err.status || err.status >= 500){
      console.warn(`${req.name}: Errored: ${getErrorString(err)}`);
    }

    else{
      log(`${req.name}: [${err.status}] ${err.message}`);
    }

    return void next(err);

  });

  //Error responses.
  //Respond with JSON errors.
  router.use((err, req, res, next) => {
    res.status(err.status || 500).send(toJSON(err));
  });

};
