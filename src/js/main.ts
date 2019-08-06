import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';
import createStores, { StoreMap } from 'stores';
import initMap, { Api } from 'core';
import ModalManager from 'libs/ModalManager';

import { map_key2color } from 'data/mapColors';

/******************************/

// main modules
const appMainMapCanvas: HTMLCanvasElement = document.createElement('canvas');
const appMainMap: Api = initMap(appMainMapCanvas);
const appStores: StoreMap = createStores();

appMainMap.loadMapData('data/data.json');

// bind stores & mainMap
(function(stores, mainMap){
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
                let newValue = newGlobalState[ `map_${ key }` ];

                mainMap.buffersManager.setColor(
                    map_key2color[ key ].index,
                    newValue
                );
            }
            mainMap.renderer.updateColors(
                mainMap.buffersManager.getColorBuffer()
            );
        }

        previosGlobalState = newGlobalState;
    });
})(appStores, appMainMap);

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
