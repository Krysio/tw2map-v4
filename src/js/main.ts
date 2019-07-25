import Renderer from 'Renderer';
import BuffersManager from 'data/BuffersManager';
import { dataLoader_v1, bitDataLoader_v1 } from 'data/loader';
import MapData from 'data/MapData';

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
            setTimeout(setBodySize, 10);
        },
        false
    );
    setBodySize();
}

/******************************/

window.addEventListener('load', async function(){
    console.log('script start');

    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let buffersManager = new BuffersManager();
    let mapData = new MapData();
    let renderer = new Renderer(
            canvas,
            buffersManager.getDataBuffer(),
            buffersManager.getColorBuffer()
        );

    await renderer.init();

    initMouseEvents(canvas, renderer);
    initResize(canvas, renderer);

    await bitDataLoader_v1(
        'data/mapv2-rc1.bin',
        buffersManager
    );
    renderer.updateData();
    renderer.requestUpdate();

    await dataLoader_v1(
        'data/data.json',
        mapData,
        buffersManager
    );
    renderer.updateData();
    renderer.requestUpdate();

    // this.window.addEventListener('click', () => {
    //     buffersManager.setColor(3, `#${ Math.random().toString(16).replace('0.', '') }000000`);
    //     renderer.updateColors();
    // }, false);

    console.log('script end');
    window['test'] = {
        renderer, buffersManager, mapData
    };
}, false);