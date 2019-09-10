import * as React from 'react';
import * as ReactDom from 'react-dom';
import debug from 'debug';

import initData from 'data';
import initCanvas, { CanvasApi } from 'canvas';
import createStores, { StoreMap } from 'stores';

import App from 'view/App';
import ModalManager from 'libs/ModalManager';

import { map_key2color } from 'canvas/data/mapColors';

/******************************/

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}

/******************************/

const debugLog = debug('app');

// main modules
const appData = initData();
const appMainCanvasElemetn: HTMLCanvasElement = document.createElement('canvas');
const appMainCanvas: CanvasApi = initCanvas(appMainCanvasElemetn, appData);
const appStores: StoreMap = createStores();

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

// bind stores & mainMap
(function(stores, mainMapEvents){
    let globalStore = stores.global,
        previosGlobalState = globalStore.getState();

    // set colors to canvas on change

    let unsubscriber = globalStore.subscribe(() => {
        let newGlobalState = globalStore.getState();

        if (newGlobalState['map'] !== previosGlobalState['map']) {
            // update colors map
            for (let key in map_key2color) {
                let color = newGlobalState['map'][ key ];

                appMainCanvas.commands.setColorInSlot(
                    map_key2color[ key ].index,
                    color
                );
            }
        }

        previosGlobalState = newGlobalState;
    });

    // change store after change canvas view

    let saveViewTimeoutId = null,
        viewState = {
            x: 0,
            y: 0,
            size: 0
        },
        saveView = () => {
            // TODO
            console.log('save world store', viewState);
        },
        requestSaveView = () => {
            if (saveViewTimeoutId !== null) {
                clearTimeout(saveViewTimeoutId);
            }

            saveViewTimeoutId = setTimeout(saveView, 3e3);
        };

    mainMapEvents.on('changed position/tile', (position) => {
        viewState.x = position.x;
        viewState.y = position.y;
        requestSaveView();
    });
    mainMapEvents.on('changed canvas/size/tile', (value) => {
        viewState.size = value;
        requestSaveView();
    });
})(appStores, appMainCanvas.events);
// bind stores with localStorage
(function(stores){
    let unsubscriber = stores.global.subscribe(() => {
        window.localStorage.setItem('global', JSON.stringify(stores.global.getState()));
    });

    stores.global.actions.importDb();
})(appStores);

/******************************/

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