process.env.TZ = 'Europe/Warsaw';

// FILE CONFING

const path = require('path');
const fs = require('fs');

let fileConfig = fs.readFileSync(path.join(
    __dirname,
    'config.json'
), {encoding: 'utf8'});
try {
    fileConfig = JSON.parse(fileConfig);
} catch (error) {}

const config = {
    ...{
        NODE_ENV: 'production',
        PORT: 1313,
        DIR_DATA: null
    },
    ...(fileConfig || {})
};

// PORT

const HTTP_PORT = process.env.PORT || config.PORT;

// ENV

const ENV = process.env.NODE_ENV || config.NODE_ENV;
const VALID_ENV_LIST = ['development', 'production'];

if (VALID_ENV_LIST.indexOf(ENV) === -1) {
    throw new Error('Invalid ENV '+ ENV +' use '+ JSON.stringify(VALID_ENV_LIST));
}

/******************************/
/*[ EXPRESS ]******************/
/******************************/

const express = require('express');
const app = express();

/******************************/
/*[ SERVER ]*******************/
/******************************/

const http = require('http');
const emptyFunction = () => null;

/******************************/

const httpServer = http.createServer();

httpServer.on('request', app);
httpServer.listen(HTTP_PORT, emptyFunction);

const STATIC_PATH = path.join(__dirname, config.DIR_STATIC || './static');

if (config.DIR_DATA) {
    app.use(
        '/data',
        express.static(config.DIR_DATA)
    );
}
app.use('/', express.static(path.join(STATIC_PATH, 'common')));
app.use('/', express.static(path.join(STATIC_PATH, ENV)));

app.use('/mapList', (req, res) => {
    res.header({'Content-Type': 'application/json; charset=utf-8'});
    res.send(`[{"market":"beta","worldList":[{"id":"zz7","name":"Tempus","active":true,"lastUpdated":1568501576241},{"id":"zz8","name":"Semper","active":true,"lastUpdated":1568501576241}]},{"market":"de","worldList":[{"id":"de33","name":"Gaillard","active":false,"lastUpdated":1565234072004},{"id":"de34","name":"Histria","active":false,"lastUpdated":1565234072004},{"id":"de35","name":"Inveraray","active":false,"lastUpdated":1565234072004},{"id":"de36","name":"Jasenov","active":true,"lastUpdated":1567092751824},{"id":"de37","name":"Krak des Chevaliers","active":false,"lastUpdated":1565234072004},{"id":"de38","name":"Landskrona","active":false,"lastUpdated":1567092751824},{"id":"de39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567092751824},{"id":"de40","name":"Navardun","active":true,"lastUpdated":1567092751824},{"id":"de41","name":"Olavinlinna","active":true,"lastUpdated":1567092751824},{"id":"de42","name":"Palamidi","active":true,"lastUpdated":1567092751824},{"id":"de43","name":"Queen's Sconce","active":true,"lastUpdated":1567092751824}]},{"market":"ru","worldList":[{"id":"ru35","name":"Inveraray","active":false,"lastUpdated":1565234159761},{"id":"ru36","name":"Jasenov","active":false,"lastUpdated":1565234159761},{"id":"ru37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567092840024},{"id":"ru38","name":"Landskrona","active":true,"lastUpdated":1567092840024},{"id":"ru39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567092840024},{"id":"ru40","name":"Navardun","active":true,"lastUpdated":1567092840024},{"id":"ru41","name":"Olavinlinna","active":true,"lastUpdated":1567092840024}]},{"market":"es","worldList":[{"id":"es30","name":"Deva","active":false,"lastUpdated":1565234218409},{"id":"es31","name":"Eketorp","active":false,"lastUpdated":1565234218409},{"id":"es32","name":"Frankenstein","active":false,"lastUpdated":1567092884740},{"id":"es33","name":"Gaillard","active":true,"lastUpdated":1567092884740},{"id":"es34","name":"Histria","active":true,"lastUpdated":1567092884740},{"id":"es35","name":"Inveraray","active":true,"lastUpdated":1567092884740},{"id":"es36","name":"Jasenov","active":true,"lastUpdated":1567092884740},{"id":"es37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567092884740}]},{"market":"it","worldList":[{"id":"it25","name":"Yburg","active":false,"lastUpdated":1565234254606},{"id":"it28","name":"Bergenhus","active":false,"lastUpdated":1565234254606},{"id":"it29","name":"Castelo de Guimarães","active":false,"lastUpdated":1565234254606},{"id":"it30","name":"Deva","active":false,"lastUpdated":1565234254606},{"id":"it31","name":"Eketorp","active":false,"lastUpdated":1565234254606},{"id":"it32","name":"Frankenstein","active":false,"lastUpdated":1565234254606},{"id":"it33","name":"Gaillard","active":false,"lastUpdated":1567092913483},{"id":"it34","name":"Histria","active":true,"lastUpdated":1567092913483},{"id":"it35","name":"Inveraray","active":true,"lastUpdated":1567092913483},{"id":"it36","name":"Jasenov","active":true,"lastUpdated":1567092913483},{"id":"it37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567092913483}]},{"market":"en","worldList":[{"id":"en39","name":"Mosteiro da Batalha","active":false,"lastUpdated":1565234299153},{"id":"en41","name":"Olavinlinna","active":false,"lastUpdated":1565234299153},{"id":"en42","name":"Palamidi","active":false,"lastUpdated":1565234299153},{"id":"en43","name":"Queen's Sconce","active":true,"lastUpdated":1567092933531},{"id":"en44","name":"Rupea","active":true,"lastUpdated":1567092933531},{"id":"en45","name":"Stargard","active":true,"lastUpdated":1567092933531},{"id":"en46","name":"Tzschocha","active":true,"lastUpdated":1567092933531},{"id":"en47","name":"Uhrovec","active":true,"lastUpdated":1567092933531}]},{"market":"fr","worldList":[{"id":"fr33","name":"Gaillard","active":false,"lastUpdated":1565234385175},{"id":"fr34","name":"Histria","active":false,"lastUpdated":1565234385176},{"id":"fr35","name":"Inveraray","active":false,"lastUpdated":1565234385176},{"id":"fr36","name":"Jasenov","active":true,"lastUpdated":1567093014020},{"id":"fr37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093014020},{"id":"fr38","name":"Landskrona","active":true,"lastUpdated":1567093014020},{"id":"fr39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567093014020},{"id":"fr40","name":"Navardun","active":true,"lastUpdated":1567093014020},{"id":"fr41","name":"Olavinlinna","active":true,"lastUpdated":1567093014020}]},{"market":"nl","worldList":[{"id":"nl29","name":"Castelo de Guimarães","active":false,"lastUpdated":1565230755800},{"id":"nl30","name":"Deva","active":true,"lastUpdated":1567093066946},{"id":"nl31","name":"Eketorp","active":true,"lastUpdated":1567093066946},{"id":"nl32","name":"Frankenstein","active":true,"lastUpdated":1567093066946},{"id":"nl33","name":"Gaillard","active":true,"lastUpdated":1567093066946},{"id":"nl34","name":"Histria","active":false,"lastUpdated":1567093066946},{"id":"nl35","name":"Inveraray","active":true,"lastUpdated":1567093066946},{"id":"nl36","name":"Jasenov","active":true,"lastUpdated":1567093066946},{"id":"nl37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093066946}]},{"market":"pl","worldList":[{"id":"pl35","name":"Inveraray","active":false,"lastUpdated":1565230823282},{"id":"pl36","name":"Jasenov","active":false,"lastUpdated":1565230823282},{"id":"pl37","name":"Krak des Chevaliers","active":false,"lastUpdated":1565230823282},{"id":"pl38","name":"Landskrona","active":false,"lastUpdated":1567093118305},{"id":"pl39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567093118305},{"id":"pl40","name":"Navardun","active":true,"lastUpdated":1567093118305},{"id":"pl41","name":"Olavinlinna","active":true,"lastUpdated":1567093118305},{"id":"pl42","name":"Palamidi","active":true,"lastUpdated":1567093118305}]},{"market":"us","worldList":[{"id":"us32","name":"Frankenstein","active":false,"lastUpdated":1565230874676},{"id":"us35","name":"Inveraray","active":false,"lastUpdated":1565230874676},{"id":"us36","name":"Jasenov","active":false,"lastUpdated":1565230874676},{"id":"us37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093166004},{"id":"us38","name":"Landskrona","active":false,"lastUpdated":1565230874676},{"id":"us39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567093166004},{"id":"us40","name":"Navardun","active":true,"lastUpdated":1567093166004},{"id":"us41","name":"Olavinlinna","active":true,"lastUpdated":1567093166004},{"id":"us42","name":"Palamidi","active":true,"lastUpdated":1567093166004}]},{"market":"gr","worldList":[{"id":"gr31","name":"Eketorp","active":false,"lastUpdated":1565230967462},{"id":"gr32","name":"Frankenstein","active":false,"lastUpdated":1565230967462},{"id":"gr33","name":"Gaillard","active":false,"lastUpdated":1565230967462},{"id":"gr34","name":"Histria","active":true,"lastUpdated":1567093280335},{"id":"gr35","name":"Inveraray","active":true,"lastUpdated":1567093280335},{"id":"gr36","name":"Jasenov","active":true,"lastUpdated":1567093280335},{"id":"gr37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093280335}]},{"market":"cz","worldList":[{"id":"cz28","name":"Bergenhus","active":false,"lastUpdated":1565230980045},{"id":"cz31","name":"Eketorp","active":false,"lastUpdated":1565230980045},{"id":"cz32","name":"Frankenstein","active":false,"lastUpdated":1565230980045},{"id":"cz33","name":"Gaillard","active":false,"lastUpdated":1565230980045},{"id":"cz34","name":"Histria","active":true,"lastUpdated":1567093299284},{"id":"cz35","name":"Inveraray","active":true,"lastUpdated":1567093299284},{"id":"cz36","name":"Jasenov","active":true,"lastUpdated":1567093299284},{"id":"cz37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093299284},{"id":"cz38","name":"Landskrona","active":true,"lastUpdated":1567093299284}]},{"market":"pt","worldList":[{"id":"pt29","name":"Castelo de Guimarães","active":false,"lastUpdated":1565231022204},{"id":"pt30","name":"Deva","active":false,"lastUpdated":1565231022204},{"id":"pt31","name":"Eketorp","active":false,"lastUpdated":1565231022204},{"id":"pt32","name":"Frankenstein","active":false,"lastUpdated":1565231022204},{"id":"pt33","name":"Gaillard","active":false,"lastUpdated":1567093340318},{"id":"pt34","name":"Histria","active":true,"lastUpdated":1567093340318},{"id":"pt35","name":"Inveraray","active":true,"lastUpdated":1567093340318},{"id":"pt36","name":"Jasenov","active":true,"lastUpdated":1567093340318}]},{"market":"se","worldList":[{"id":"se28","name":"Bergenhus","active":false,"lastUpdated":1557760553881},{"id":"en39","name":"Mosteiro da Batalha","active":false,"lastUpdated":1565231033998},{"id":"en41","name":"Olavinlinna","active":false,"lastUpdated":1565231033998},{"id":"en42","name":"Palamidi","active":false,"lastUpdated":1565231033998},{"id":"en43","name":"Queen's Sconce","active":true,"lastUpdated":1567093360814},{"id":"en44","name":"Rupea","active":true,"lastUpdated":1567093360814},{"id":"en45","name":"Stargard","active":true,"lastUpdated":1567093360814},{"id":"en46","name":"Tzschocha","active":true,"lastUpdated":1567093360814},{"id":"en47","name":"Uhrovec","active":true,"lastUpdated":1567093360814}]},{"market":"no","worldList":[{"id":"no24","name":"Xativa","active":false,"lastUpdated":1557760554264},{"id":"no26","name":"Zipser Burg","active":false,"lastUpdated":1557760554264},{"id":"no27","name":"Alhambra","active":false,"lastUpdated":1557760554264},{"id":"en41","name":"Olavinlinna","active":false,"lastUpdated":1565231122881},{"id":"en39","name":"Mosteiro da Batalha","active":false,"lastUpdated":1565231122881},{"id":"en44","name":"Rupea","active":true,"lastUpdated":1567093443745},{"id":"en43","name":"Queen's Sconce","active":true,"lastUpdated":1567093443745},{"id":"en42","name":"Palamidi","active":false,"lastUpdated":1565231122881},{"id":"en45","name":"Stargard","active":true,"lastUpdated":1567093443745},{"id":"en46","name":"Tzschocha","active":true,"lastUpdated":1567093443745},{"id":"en47","name":"Uhrovec","active":true,"lastUpdated":1567093443745}]},{"market":"sk","worldList":[{"id":"sk30","name":"Deva","active":false,"lastUpdated":1565231307357},{"id":"sk31","name":"Eketorp","active":false,"lastUpdated":1565231307357},{"id":"sk32","name":"Frankenstein","active":false,"lastUpdated":1565231307357},{"id":"sk33","name":"Gaillard","active":false,"lastUpdated":1565231307357},{"id":"sk34","name":"Histria","active":true,"lastUpdated":1567093606307},{"id":"sk35","name":"Inveraray","active":false,"lastUpdated":1567093606307},{"id":"sk36","name":"Jasenov","active":true,"lastUpdated":1567093606307},{"id":"sk37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093606307}]},{"market":"ro","worldList":[{"id":"ro21","name":"Urquhart Castle","active":false,"lastUpdated":1565231324171},{"id":"ro26","name":"Zipser Burg","active":false,"lastUpdated":1565231324171},{"id":"ro29","name":"Castelo de Guimarães","active":false,"lastUpdated":1565231324171},{"id":"ro30","name":"Deva","active":false,"lastUpdated":1565231324171},{"id":"ro31","name":"Eketorp","active":true,"lastUpdated":1567093620386},{"id":"ro32","name":"Frankenstein","active":false,"lastUpdated":1565231324171},{"id":"ro33","name":"Gaillard","active":true,"lastUpdated":1567093620386},{"id":"ro34","name":"Histria","active":false,"lastUpdated":1567093620386},{"id":"ro35","name":"Inveraray","active":true,"lastUpdated":1567093620386},{"id":"ro36","name":"Jasenov","active":true,"lastUpdated":1567093620386},{"id":"ro37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093620386}]},{"market":"hu","worldList":[{"id":"hu31","name":"Eketorp","active":false,"lastUpdated":1565231392860},{"id":"hu32","name":"Frankenstein","active":false,"lastUpdated":1565231392860},{"id":"hu33","name":"Gaillard","active":false,"lastUpdated":1565231392860},{"id":"hu34","name":"Histria","active":false,"lastUpdated":1567093651709},{"id":"hu35","name":"Inveraray","active":true,"lastUpdated":1567093651709},{"id":"hu36","name":"Jasenov","active":true,"lastUpdated":1567093651709},{"id":"hu37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093651709}]},{"market":"br","worldList":[{"id":"br32","name":"Frankenstein","active":false,"lastUpdated":1565231407605},{"id":"br33","name":"Gaillard","active":false,"lastUpdated":1565231407605},{"id":"br34","name":"Histria","active":false,"lastUpdated":1565231407605},{"id":"br35","name":"Inveraray","active":false,"lastUpdated":1565231407605},{"id":"br36","name":"Jasenov","active":true,"lastUpdated":1567093670552},{"id":"br37","name":"Krak des Chevaliers","active":true,"lastUpdated":1567093670552},{"id":"br38","name":"Landskrona","active":true,"lastUpdated":1567093670552},{"id":"br39","name":"Mosteiro da Batalha","active":true,"lastUpdated":1567093670552},{"id":"br40","name":"Navardun","active":true,"lastUpdated":1567093670552}]},{"market":"fi","worldList":[{"id":"fi27","name":"Alhambra","active":false,"lastUpdated":1556219741204},{"id":"fi28","name":"Bergenhus","active":false,"lastUpdated":1556219741204},{"id":"en39","name":"Mosteiro da Batalha","active":false,"lastUpdated":1565231220713},{"id":"en41","name":"Olavinlinna","active":false,"lastUpdated":1565231220713},{"id":"en42","name":"Palamidi","active":false,"lastUpdated":1565231220713},{"id":"en44","name":"Rupea","active":true,"lastUpdated":1567093530218},{"id":"en43","name":"Queen's Sconce","active":true,"lastUpdated":1567093530218},{"id":"en45","name":"Stargard","active":true,"lastUpdated":1567093530218},{"id":"en46","name":"Tzschocha","active":true,"lastUpdated":1567093530218},{"id":"en47","name":"Uhrovec","active":true,"lastUpdated":1567093530218}]}]`);
});

// Default request
app.use((req, res) => {
    res.sendFile(`index.html`, {root: `./static/${ ENV }`});
});

console.log(`Running ${ ENV } server at port ${ HTTP_PORT }`);
