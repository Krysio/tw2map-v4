import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';
import createStores, { StoreMap } from 'stores';
import initMap, { Api } from 'core';

/******************************/

const appStores: StoreMap = createStores();
const appMainMapCanvas: HTMLCanvasElement = document.createElement('canvas');
const appMainMap: Api = initMap(appMainMapCanvas);
const appView: React.ReactElement = React.createElement(
    App,
    {
        stores: appStores,
        mainMap: appMainMap
    }
);

/******************************/

ReactDom.render(
    appView,
    window.document.getElementById('root')
);
