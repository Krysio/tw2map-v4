import * as React from 'react';
import * as ReactDom from 'react-dom';
import App from 'view/App';

/******************************/

ReactDom.render(
    React.createElement(App),
    window.document.getElementById('root')
);
