function createShader(
    webGl2Context: WebGL2RenderingContext,
    type: number,
    source: string
): WebGLShader {
    let shader = webGl2Context.createShader(type);

    webGl2Context.shaderSource(shader, source);
    webGl2Context.compileShader(shader);

    let success = webGl2Context.getShaderParameter(
        shader,
        webGl2Context.COMPILE_STATUS
    );

    if (success) {
        return shader;
    }

    console.log(`Shader {${ type }} error`);
    console.log(webGl2Context.getShaderInfoLog(shader));
    webGl2Context.deleteShader(shader);
}

function createProgram(
    webGl2Context: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram {
    let program = webGl2Context.createProgram();

    webGl2Context.attachShader(program, vertexShader);
    webGl2Context.attachShader(program, fragmentShader);
    webGl2Context.linkProgram(program);

    let success = webGl2Context.getProgramParameter(
        program,
        webGl2Context.LINK_STATUS
    );

    if (success) {
        return program;
    }

    console.log(webGl2Context.getProgramInfoLog(program));
    webGl2Context.deleteProgram(program);
}

/******************************/

type TextureDataStructure = {
    slot: number,
    texture: WebGLTexture,
    uniformLocation: WebGLUniformLocation,
    unit: number
};

/******************************/

export default class Renderer {
    protected shaderProgram: WebGLShader;
    protected context: WebGL2RenderingContext;
    protected textures: {
        data: TextureDataStructure,
        color: TextureDataStructure
    };
    protected uniforms: {
        position: WebGLUniformLocation,
        size: WebGLUniformLocation,
        time: WebGLUniformLocation,
        resolution: WebGLUniformLocation
    };
    protected state: {
        size: number,
        position: {
            x: number,
            y: number
        },
        requestUpdate: boolean
    } = {
        size: null,
        position: {
            x: null,
            y: null
        },
        requestUpdate: false
    };
    protected inited = false;

    constructor(
        protected canvas: HTMLCanvasElement,
        protected dataBuffer: Uint16Array,
        protected colorBuffer: Uint8Array
    ) {
        this.context = canvas.getContext('webgl2') as WebGL2RenderingContext;

        this.animationFrame = this.animationFrame.bind(this);
    }

    async init() {
        console.log('init:start');

        this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.context.clearColor(0, 0, 0, 0);
        this.context.clear(this.context.COLOR_BUFFER_BIT);

        await this.initShaders();
        this.inited = true; // because JS has an one thread

        this.initVerticles();
        this.initTextures();
        this.initUniforms();

        console.log('init:end');
        return;
    }

    async initShaders() {
        let vertexShaderSource = await (
                await fetch('glsl/vertex.glsl')
            ).text();
        let fragmentShaderSource = await (
                await fetch('glsl/fragment.glsl')
            ).text();

        let { VERTEX_SHADER, FRAGMENT_SHADER } = this.context;

        let vertexShader = createShader(
                this.context,
                VERTEX_SHADER,
                vertexShaderSource
            );
        let fragmentShader = createShader(
                this.context,
                FRAGMENT_SHADER,
                fragmentShaderSource
            );

        this.shaderProgram = createProgram(
            this.context,
            vertexShader,
            fragmentShader
        );
        this.context.useProgram(this.shaderProgram);
    }

    initVerticles() {
        let { ARRAY_BUFFER, STATIC_DRAW, FLOAT } = this.context;

        let positionBuffer = this.context.createBuffer();
        let positionAttributeLocation = this.context.getAttribLocation(
            this.shaderProgram,
            'vertexIndex'
        );

        this.context.bindBuffer(
            ARRAY_BUFFER,
            positionBuffer
        );
        this.context.bufferData(
            ARRAY_BUFFER,
            new Float32Array([0,1,2,3]),
            STATIC_DRAW
        );

        this.context.enableVertexAttribArray(
            positionAttributeLocation
        );
        this.context.vertexAttribPointer(
            positionAttributeLocation,
            1,          // size - 2 components per iteration
            FLOAT,      // type - the data is 32bit floats
            false,      // normalize - don't normalize the data
            0,          // stride - 0 = move forward size * sizeof(type) each iteration to get the next position
            0           // offset - start at the beginning of the buffer
        );
    }

    //https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
    initTextures() {
        let { TEXTURE0, TEXTURE1 } = this.context;

        this.textures = {
            data: {
                slot: TEXTURE0,
                unit: 0,
                texture: this.context.createTexture(),
                uniformLocation: this.context.getUniformLocation(
                    this.shaderProgram,
                    'iData'
                )
            },
            color: {
                slot: TEXTURE1,
                unit: 1,
                texture: this.context.createTexture(),
                uniformLocation: this.context.getUniformLocation(
                    this.shaderProgram,
                    'iColor'
                )
            }
        };

        let {
            TEXTURE_2D,
            RGB16UI, RGB_INTEGER,
            RGBA8UI, RGBA_INTEGER,
            UNSIGNED_SHORT, UNSIGNED_BYTE,
            TEXTURE_WRAP_S, TEXTURE_WRAP_T,
            TEXTURE_MAG_FILTER, TEXTURE_MIN_FILTER,
            REPEAT, NEAREST
        } = this.context;

        // data
        this.context.bindTexture(
            TEXTURE_2D,
            this.textures.data.texture
        );
        this.context.texImage2D(
            TEXTURE_2D, 0,
            RGB16UI,
            1024, 1024, 0,
            RGB_INTEGER, UNSIGNED_SHORT,
            this.dataBuffer
        );
        this.context.texParameteri(TEXTURE_2D, TEXTURE_WRAP_S, REPEAT);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_WRAP_T, REPEAT);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_MAG_FILTER, NEAREST);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, NEAREST);
        this.context.uniform1i(
            this.textures.data.uniformLocation,
            this.textures.data.unit
        );

        // color
        this.context.bindTexture(
            TEXTURE_2D,
            this.textures.color.texture
        );
        this.context.texImage2D(
            TEXTURE_2D, 0,
            RGBA8UI,
            1024, 1, 0,
            RGBA_INTEGER, UNSIGNED_BYTE,
            this.colorBuffer
        );
        this.context.texParameteri(TEXTURE_2D, TEXTURE_WRAP_S, REPEAT);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_WRAP_T, REPEAT);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_MAG_FILTER, NEAREST);
        this.context.texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, NEAREST);
        this.context.uniform1i(
            this.textures.color.uniformLocation,
            this.textures.color.unit
        );

        // active
        this.context.activeTexture(this.textures.data.slot);
        this.context.bindTexture(
            TEXTURE_2D,
            this.textures.data.texture
        );
        this.context.activeTexture(this.textures.color.slot);
        this.context.bindTexture(
            TEXTURE_2D,
            this.textures.color.texture
        );
    }

    initUniforms() {
        this.uniforms = {
            position: this.context.getUniformLocation(
                this.shaderProgram,
                'iPosition'
            ),
            size: this.context.getUniformLocation(
                this.shaderProgram,
                'iSize'
            ),
            time: this.context.getUniformLocation(
                this.shaderProgram,
                'iTime'
            ),
            resolution: this.context.getUniformLocation(
                this.shaderProgram,
                'iResolution'
            )
        }

        this.setSize(50);
        this.setPosition(0.5, 0.5);
        this.updateResolution();
    }

    /******************************/

    setSize(
        value: number
    ): void {
        if (!this.isAvaiable()) return;

        let newValue = Math.max(4, Math.min(value, 100));

        if (this.state.size !== newValue) {
            this.state.size = newValue;
            this.context.uniform1f(this.uniforms.size, newValue);
        }

        this.requestUpdate();
    }

    addToSize(
        value: number
    ): void {
        this.setSize(this.state.size + value);
    }

    multipleSize(
        value: number
    ): void {
        this.setSize(this.state.size * value);
    }

    setPosition(
        valueX: number,
        valueY: number
    ): void {
        if (!this.isAvaiable()) return;

        let newValueX = Math.max(0, Math.min(valueX, 1)),
            newValueY = Math.max(0, Math.min(valueY, 1));

        if (this.state.position.x !== newValueX
            || this.state.position.y !== newValueY
        ) {
            this.state.position.x = newValueX;
            this.state.position.y = newValueY;
            this.context.uniform2f(
                this.uniforms.position,
                newValueX,
                newValueY
            );
        }

        this.requestUpdate();
    }

    addPosition(
        valueX: number,
        valueY: number
    ): void {
        this.setPosition(
            this.state.position.x + valueX,
            this.state.position.y + valueY
        );
    }

    calcNewPosition(
        pixelMoveX: number,
        pixelMoveY: number
    ): void {
        this.addPosition(
            pixelMoveX / (1000.0 * 0.5 * 1.0) / this.state.size,
            pixelMoveY / (1000.0 * 0.5 * 1.7) / this.state.size
        );
    }

    updateResolution(): void {
        if (!this.isAvaiable()) return;

        this.context.viewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        this.context.uniform2f(
            this.uniforms.resolution,
            this.canvas.width,
            this.canvas.height
        );

        this.requestUpdate();
    }

    /******************************/

    isAvaiable() {
        return this.inited;
    }

    /******************************/

    requestUpdate() {
        if (this.isAvaiable() && !this.state.requestUpdate) {
            this.state.requestUpdate = true;
            requestAnimationFrame(this.animationFrame);
        }
    }
    protected animationFrame() {
        this.state.requestUpdate = false;
        this.context.uniform1f(
            this.uniforms.time,
            Date.now()
        );
        this.context.drawArrays(
            this.context.TRIANGLE_FAN, // primitiveType
            0, // offset,
            4 // count
        );
    }
}