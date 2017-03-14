'use strict';

const path = require('path');
const fs = require('fs');
const {Future} = require('fluture');
const {Nothing, Just, encase} = require('../prelude');

//readFile :: Path -> Future Error Buffer
const readFile = encoding => file => Future.node(done => fs.readFile(file, encoding, done));

//writeFile :: Path -> Buffer -> Future Error ()
const writeFile = file => buf => Future.node(done => fs.writeFile(file, buf, done));

//getDirectory :: CacheConfiguration -> Path
const getDirectory = config => path.resolve(__dirname, '../../', config.directory);

//getFilename :: Path -> CacheKey -> Path
const getFilename = (dir, key) => `${dir}/${encodeURIComponent(key)}.json`;

//write :: CacheConfiguration -> CacheKey -> String -> Future Error ()
exports.write = config => {
  const dir = getDirectory(config);
  return key => value => writeFile(getFilename(dir, key))(String(value));
};

//writeStream :: CacheConfiguration -> CacheKey -> Maybe WritableStream
exports.writeStream = config => {
  const dir = getDirectory(config);
  return key => encase(fs.createWriteStream)(getFilename(dir, key));
};

//read :: CacheConfiguration -> CacheKey -> Future Error (Maybe String)
exports.read = config => {
  const dir = getDirectory(config);
  return key => readFile('utf8')(getFilename(dir, key)).fold(Nothing, Just);
};

//readStream :: CacheConfiguration -> CacheKey -> Maybe ReadableStream
exports.readStream = config => {
  const dir = getDirectory(config);
  return key => encase(fs.createReadStream)(getFilename(dir, key));
};
