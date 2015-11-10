'use strict';

const normalizeError = err => {
  const {status, message, stack} = err;
  return Object.assign({
    status: 500,
    message: 'Something went wrong',
    stack: new Error('Unrecognised error').stack
  }, {status, message, stack});
};

export default router => {

  //Error responses.
  router.use((err, req, res) => {
    const {status, message, stack} = normalizeError(err);
    const env = process.env.NODE_ENV;
    res.type('text');
    res.status(status);
    res.send(
      env === 'producton'
      ? status < 500
      ? message
      : `Error ${status} happened. :(`
      : stack
    );
  });

};
