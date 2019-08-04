import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';
import createStores, { StoreMap } from 'stores';
import initMap, { Api } from 'core';
import ModalManager from 'libs/ModalManager';

/******************************/

const appStores: StoreMap = createStores();
const appMainMapCanvas: HTMLCanvasElement = document.createElement('canvas');
const appMainMap: Api = initMap(appMainMapCanvas);
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
