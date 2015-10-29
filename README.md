# Node Server Skeleton

## Get it running

* Install [Node][1], NPM and build tools: `apt-get install nodejs nodejs-legacy build-essential`
* Bump Node to version `4.2.x`: `sudo npm install n && sudo n ^4.2.0`
* Clone this repository. Rename the remote and add your own remote.
* Configure now, refer to the section about Configuration below.
* Use `npm run setup` to perform the initial build.
* Use `npm start` or a tool like PM2 to run the process.
* Alternatively, `npm run dev` starts the process in development mode.

## Configuration

Simply `cp config/default.json config/{dest}` where `dest` can be any of the following:

* `local.json`
* `[deployment].json`
* `[deployment]-[instance].json`
* `[hostname].json`
* `[hostname]-[instance].json`
* `[hostname]-[deployment].json`
* `[hostname]-[deployment]-[instance].json`

Configuration files are loaded in the order shown above, where every next file
overrides the previous. Any options that are left out will be loaded from
`default.json`. `local.json` is always loaded, others follow the rules below:

`Deployment` Is matched against the `NODE_ENV` environment variable.

`Instance` Is matched against the `NODE_APP_INSTANCE` environment variable for
different configuration files per cluster instance. Tools like PM2 set the
`NODE_APP_INSTANCE` automatically.

`Hostname` Is matched against the machine host name.

For more information on configuration see [the wiki][2].

## Tasks

* `npm run test`: Cleans, lints, unit tests and integration tests.
* `npm run test:unit`: Unit tests.
* `npm run test:integration`: Integration tests.
* `npm run lint`: Static code analysis.
* `npm run start`: Start the program.
* `npm run dev`: Starts the program in development mode.
* `npm run clean`: Removes build files and logs.
* `npm run setup`: Install dependencies, test and build.
* `npm run version`: Runs the version check. Useful for other tasks.

## Stack

### Application

* The http service is provided by [Koa][14].
* [Bluebird][3] provides a super-fast [Promise/A+][4] implementation.
* Data manipulation utilities are provided by [Ramda][5].

### Testing

* Unit tests with [mocha][6], [chai][7] and [sinon][8].
* Code coverage reports for unit tests using [istanbul][9] and [isparta][10].

### Build tools

* ES2015 syntax using [Babel compiler][11].
* Code linting with [eslint][12].

<!-- ## References -->

[1]:   https://nodejs.org/download/
[2]:   https://github.com/lorenwest/node-config/wiki
[3]:   https://github.com/petkaantonov/bluebird
[4]:   https://promisesaplus.com/
[5]:   http://ramdajs.com/0.17/index.html
[6]:   http://mochajs.org/
[7]:   http://chaijs.com/api/bdd/
[8]:   http://sinonjs.org/
[9]:   https://github.com/gotwarlost/istanbul
[10]:  https://github.com/douglasduteil/isparta
[11]:  https://babeljs.io/
[12]:  http://eslint.org/
[14]:  http://koajs.com/
