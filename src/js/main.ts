import Renderer from './Renderer';

/******************************/

function initMouseEvents(
    element: HTMLElement,
    renderer: Renderer
): void {
    let state = {
        prev: [0, 0],
        current: [0, 0],
        click: false,
        move: false
    };

    element.addEventListener('mousemove', (e: MouseEvent) => {
        if (state.click) {
            state.current[0] = e.offsetX;
            state.current[1] = e.offsetY;

            let diffX = state.prev[0] - state.current[0],
                diffY = state.prev[1] - state.current[1];

            if (diffX > 5 || diffX < -5
                || diffY > 5 || diffY < -5
            ) {
                state.move = true;
            }

            if (state.move) {
                renderer.calcNewPosition(diffX, diffY);
                state.prev[0] = e.offsetX;
                state.prev[1] = e.offsetY;
            }
        }
    }, false);

    element.addEventListener('mousedown', (e: MouseEvent) => {
        state.prev[0] = e.offsetX;
        state.prev[1] = e.offsetY;
        state.click = true;
    }, false);

    element.addEventListener('mouseup', (e: MouseEvent) => {
        state.click = false;
        state.move = false;
    }, false);

    element.addEventListener('mouseleave', (e: MouseEvent) => {
        state.click = false;
        state.move = false;
    }, false);

    // wheel - zoom
    element.addEventListener('wheel', (e: MouseEvent) => {
        if (e['deltaY'] < 0) {
            renderer.multipleSize(1 + 0.1);
        } else {
            renderer.multipleSize(1 - 0.1);
        }
    }, false);
}

function initResize(
    canvas: HTMLCanvasElement,
    renderer: Renderer
): void {
    let setBodySize = (function(renderer) {
        let { clientWidth: width, clientHeight: height } = document.body;

        canvas.setAttribute('width', width.toString());
        canvas.setAttribute('height', height.toString());

        Object.assign(canvas.style, {
            width: `${ width }px`,
            height: `${ height }px`
        });

        this.updateResolution();
    }).bind(renderer);

    window.addEventListener(
        'resize',
        () => {
            setBodySize();
            this.setTimeout(setBodySize, 10);
        },
        false
    );
    setBodySize();
}

/******************************/

window.addEventListener('load', async function(){
    console.log('script start');

    let size = 1024,
        dataBuffer = new Uint16Array(size * size * 3),
        colorBuffer = new Uint8Array(size * 4);

    for (var i = 0; i < size * size * 3; i+= 3) {
        dataBuffer[ i + 0 ] = 0;
        dataBuffer[ i + 1 ] = Math.floor(Math.random() * 255);
        dataBuffer[ i + 2 ] = Math.floor(Math.random() * 255) % 4;
    }

    for (var i = 0; i < size * 4; i+= 4) {
        colorBuffer[ i + 0 ] = Math.floor(Math.random() * 255);
        colorBuffer[ i + 1 ] = Math.floor(Math.random() * 255);
        colorBuffer[ i + 2 ] = Math.floor(Math.random() * 255);
        colorBuffer[ i + 3 ] = Math.floor(Math.random() * 255);
    }
    colorBuffer[0] = 0;
    colorBuffer[1] = 64;
    colorBuffer[2] = 0;

    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let renderer = new Renderer(
            canvas,
            dataBuffer,
            colorBuffer
        );

    await renderer.init();

    initMouseEvents(canvas, renderer);
    initResize(canvas, renderer);

    console.log('script end');
    window['test'] = renderer;
}, false);