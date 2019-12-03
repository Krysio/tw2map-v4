process.env.TZ = 'Europe/Warsaw';

// PORT

const httpPort = process.env.PORT || 1338;

// ENV

const ENV = process.env.NODE_ENV || 'production';
const VALID_ENV_LIST = ['development', 'production'];

if (VALID_ENV_LIST.indexOf(ENV) === -1) {
    throw new Error('Invalid ENV '+ ENV +' use '+ JSON.stringify(VALID_ENV_LIST));
}

/******************************/
/*[ EXPRESS ]******************/
/******************************/

const path = require('path');
const express = require('express');
const app = express();

/******************************/
/*[ SERVER ]*******************/
/******************************/

const http = require('http');
const emptyFunction = () => null;

/******************************/

let httpServer = http.createServer();

httpServer.on('request', app);
httpServer.listen(httpPort, emptyFunction);

let staticPath = path.join(__dirname, './static');

app.use('/', express.static(path.join(staticPath, 'common')));
app.use('/', express.static(path.join(staticPath, ENV)));

// Default request
app.use((req, res) => {
    res.sendFile(`index.html`, {root: `./static/${ ENV }`});
});

console.log(`Running ${ ENV } server at port ${ httpPort }`);
