import debug from 'debug';

// debug logging

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}

/******************************/

import createContext from 'context';

const context = createContext();

/******************************/

// binding

import bindMainCanvasGlobalStore from 'bind/mainCanvas-globalStore';
import bindMainCanvasWorldStore from 'bind/mainCanvas-worldStore';
import bindLocalStorageGlobalStore from 'bind/localStorage-globalStore';
import bindMainCanvasStateStore from 'bind/mainCanvas-stateStore';
import bindLocalStorageWorldStore from 'bind/localStorage-worldStore';
import bindMainCanvasWorldStoreMarkers from 'bind/mainCanvas-worldStoreMarkers';

bindMainCanvasGlobalStore(context);
bindMainCanvasWorldStore(context);
bindLocalStorageGlobalStore(context);
bindMainCanvasStateStore(context);
bindLocalStorageWorldStore(context);
bindMainCanvasWorldStoreMarkers(context);

/******************************/

import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';

// view

(function(){
    window.document.getElementById('loader').remove();

    // view;
    const appView: React.ReactElement = React.createElement(App, { context });

    /******************************/

    ReactDom.render(
        appView,
        window.document.getElementById('root')
    );
})();

if (process.env.NODE_ENV === 'development') {
    window['dev'] = window['dev'] || {};
    window['dev'].context = context;
}