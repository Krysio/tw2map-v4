import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';
import createStores, { StoreMap } from 'stores';
import initMap, { MapApi } from 'map';
import ModalManager from 'libs/ModalManager';

import { map_key2color } from 'map/data/mapColors';

/******************************/

// main modules
const appMainMapCanvas: HTMLCanvasElement = document.createElement('canvas');
const appMainMap: MapApi = initMap(appMainMapCanvas);
const appStores: StoreMap = createStores();

(async function(){
    await appMainMap.initPromise;

    /******************************/

    // async
    (async function(){
        let bacgroundBitData = await (
            await fetch('data/mapv2-rc1.bin')
        ).arrayBuffer();

        appMainMap.events.emit('data/bg', bacgroundBitData);
    })();
    (async function(){
        let jsonData = await (
            await fetch('data/data.json')
        ).json();

        appMainMap.events.emit('data/load', jsonData);
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

                mainMapEvents.emit('map/color', {
                    index: map_key2color[ key ].index,
                    color: color
                });
            }
        }

        previosGlobalState = newGlobalState;
    });
})(appStores, appMainMap.events);

/******************************/

(function(){
    // view
    const modalSystem: ModalManager = new ModalManager();
    const appView: React.ReactElement = React.createElement(
        App,
        {
            stores: appStores,
            mainMap: appMainMap,
            modalSystem: modalSystem
        }
    );

    /******************************/

    ReactDom.render(
        appView,
        window.document.getElementById('root')
    );
})();