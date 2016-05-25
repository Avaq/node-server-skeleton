const path = require('path');
const fs = require('fs');

const DIR = path.resolve(__dirname, '../node_modules/sanctuary-env');

const SCRIPT = `
module.exports = process.env.NODE_ENV === 'development'
  ? require('sanctuary')
  : require('sanctuary').unchecked
`;

try{
  fs.mkdirSync(DIR);
}

catch(e){
  if(e.code !== 'EEXIST') throw e;
}

fs.writeFileSync(`${DIR}/index.js`, SCRIPT);
