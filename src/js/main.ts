import * as React from 'react';
import * as ReactDom from 'react-dom';
import debug from 'debug';

import initData from 'data';
import initCanvas, { CanvasApi } from 'canvas';
import createStores from 'stores';

import App from 'view/App';
import ModalManager from 'libs/ModalManager';

/******************************/

// debug logging

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}
const debugLog = debug('app');

/******************************/

// main modules

const appData = initData();
const appMainCanvasElemetn: HTMLCanvasElement = document.createElement('canvas');
const appMainCanvas: CanvasApi = initCanvas(appMainCanvasElemetn, appData);
const appStores = createStores();

// TODO load data

(async function(){
    await appMainCanvas.initPromise;

    debugLog('async');

    /******************************/

    // async
    (async function(){
        let bacgroundBitData = await (
            await fetch('data/mapv2-rc1.bin')
        ).arrayBuffer();

        debugLog('async bg');
        appData.commands.loadBackgroundData(bacgroundBitData);
    })();
    (async function(){
        let jsonData = await (
            await fetch('data/data.json')
        ).json();

        debugLog('async data');
        appData.commands.loadBaseBata(jsonData);
    })();
})();

/******************************/

// binding

import bindMainCanvasGlobalStore from 'bind/mainCanvas-globalStore';
import bindMainCanvasWorldStore from 'bind/mainCanvas-worldStore';
import bindLocalStorageGlobalStore from 'bind/localStorage-globalStore';
import bindLocalStorageWorldStore from 'bind/localStorage-worldStore';

bindMainCanvasGlobalStore(appMainCanvas, appStores.global);
bindMainCanvasWorldStore(appMainCanvas, appStores.world);
bindLocalStorageGlobalStore(appStores.global);
bindLocalStorageWorldStore(appStores.world);

/******************************/

// view

(function(){
    window.document.getElementById('loader').remove();

    // view
    const modalSystem: ModalManager = new ModalManager();
    const appView: React.ReactElement = React.createElement(
        App,
        {
            stores: appStores,
            mainCanvas: appMainCanvas,
            appData: appData,
            modalSystem: modalSystem
        }
    );

    /******************************/

    ReactDom.render(
        appView,
        window.document.getElementById('root')
    );
})();