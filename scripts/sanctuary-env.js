const path = require('path');
const fs = require('fs');

const DIR = path.resolve(__dirname, '../node_modules/sanctuary-env');

const SCRIPT = `
const sanctuary = require('sanctuary');
module.exports = sanctuary.create({
  checkTypes: process.env.NODE_ENV === 'development',
  env: sanctuary.env
})
`;

try{
  fs.mkdirSync(DIR);
}

catch(e){
  if(e.code !== 'EEXIST') throw e;
}

fs.writeFileSync(`${DIR}/index.js`, SCRIPT);
