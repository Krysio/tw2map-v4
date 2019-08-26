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

    let unsubscriber = globalStore.subscribe(() => {
        let newGlobalState = globalStore.getState(),
            flagChanged: boolean;

        flagChanged = false;
        for (let key in map_key2color) {
            let newValue = newGlobalState[ `map_${ key }` ],
                oldValue = previosGlobalState[ `map_${ key }` ];

            if (newValue !== oldValue) {
                flagChanged = true;
            }
        }

        if (flagChanged) {
            // update colors map
            for (let key in map_key2color) {
                let color = newGlobalState[ `map_${ key }` ];

                appMainCanvas.commands.setColorInSlot(
                    map_key2color[ key ].index,
                    color
                );
            }
        }

        previosGlobalState = newGlobalState;
    });
})(appStores, appMainCanvas.events);

/******************************/

(function(){
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