'use strict';

export default router => {

  //Access control.
  router.use((req, res, next) => {

    if(!req.headers.origin){
      return next();
    }

    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');

    if(req.method !== 'OPTIONS'){
      return next();
    }

    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    res.end();

  });

};
