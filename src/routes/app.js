'use strict';

import dispatch from '../framework/dispatch';

export default router => {

  router.get('/', dispatch('index'));

};
