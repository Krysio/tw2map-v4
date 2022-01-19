#ifdef GL_ES
    precision highp float;
    precision highp int;
#endif

attribute vec4 vertexIndex;

varying vec2 corner;
varying vec2 pixelPosition;
varying vec2 halfResolution;

varying float smoothWeight;

varying vec2 radius;
varying vec2 halfRadius;
varying vec2 normalizedRadius;

uniform vec2 iResolution;
uniform float iSize;

void main() {
    halfResolution = iResolution * 0.5;

    radius = vec2(1.0, 1.7);
    halfRadius = radius * 0.5;
    normalizedRadius = normalize(radius);

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