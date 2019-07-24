#version 300 es

precision mediump float;

in vec4 vertexIndex;

out vec2 corner;
out vec2 pixelPosition;
out float smoothWeight;

uniform vec2 iResolution;
uniform float iSize;

void main() {
    smoothWeight = 2.0 / iSize;

    if (vertexIndex.x == 0.0) {
        corner = vec2(1.0, 0.0);
        gl_Position = vec4(1.0, 1.0, 0.0, 1.0);
    } else if (vertexIndex.x == 1.0) {
        corner = vec2(0.0, 0.0);
        gl_Position = vec4(-1.0, 1.0, 0.0, 1.0);
    } else if (vertexIndex.x == 2.0) {
        corner = vec2(0.0, 1.0);
        gl_Position = vec4(-1.0, -1.0, 0.0, 1.0);
    } else if (vertexIndex.x == 3.0) {
        corner = vec2(1.0, 1.0);
        gl_Position = vec4(1.0, -1.0, 0.0, 1.0);
    }

    pixelPosition = vec2(corner.x * iResolution.x, corner.y * iResolution.y);
}