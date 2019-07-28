precision highp float;

varying vec2 corner;
varying vec2 pixelPosition;
varying vec2 halfResolution;

varying float smoothWeight;

varying vec2 radius;
varying vec2 halfRadius;
varying vec2 normalizedRadius;

uniform float iTime;
uniform float iSize;
uniform vec2 iPosition;
uniform vec2 iResolution;
uniform mediump sampler2D iData;
uniform lowp sampler2D iColor;

float randSeed;

float round(float x) { return floor(x + 0.5); }
 vec2 round(vec2 x)  { return floor(x + 0.5); }
 vec3 round(vec3 x)  { return floor(x + 0.5); }
 vec4 round(vec4 x)  { return floor(x + 0.5); }

float hexDistanceToCenter(vec2 p) {
    p = abs(p);
    float d = dot(p, normalizedRadius);
	return max(p.x, d) * 2.0;
}

vec4 hexCoords(vec2 uv) {
    vec2 a = mod(uv, radius) - halfRadius;
    vec2 b = mod(uv - halfRadius, radius) - halfRadius;
    vec2 gv = length(a) < length(b) ? a : b;

    return vec4(
        floor(uv.x - gv.x), // x
        (uv.y - gv.y) / radius.y * 2.0, // y
        hexDistanceToCenter(gv), // distance to center {0.0 - 1.0}, 1.0 = border
        0.0//atan(gv.x, gv.y) // radian
    );
}

void main() {
    randSeed = 1.0;

    vec2 pxPosCentered = vec2(pixelPosition - halfResolution);
    vec2 scalar = vec2(1.0) * iSize;

    vec4 hexCoord = hexCoords(
        vec2(
            pxPosCentered.x + 1000.0 * iPosition.x * iSize,
            pxPosCentered.y + 1000.0 * 0.5 * radius.y * iPosition.y * iSize
        ) / scalar
    );
    vec2 roundedHexCoord = round(hexCoord.xy);

    // dane pola
    mediump vec4 data;

    // poza obszarem mapy

    if (roundedHexCoord.x < 0.0
        || roundedHexCoord.x >= 1000.0
        || roundedHexCoord.y < 0.0
        || roundedHexCoord.y >= 1000.0
    ) {
        data = vec4(0, 0, 0, 0);
    } else {
        data = texture2D(
            iData,
            roundedHexCoord.xy / 1024.0
        );
    }

    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // if (roundedHexCoord.x == 500.0
    //     && roundedHexCoord.y == 500.0
    // ) {
    //     vec4 test = texture2D(iData, vec2(500.0, 500.0));
    //     gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    //     if (test.x > 0.0) {
    //         gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    //     }
    //     if (test.x < 0.0) {
    //         gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    //     }
    //     if (test.x == 0.0) {
    //         gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    //     }
    // }
    // if (data.z == 0.0) {
    //     gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    // } else if (data.z == (1.0 / 255.0)) {
    //     gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    // } else if (data.z == (2.0 / 255.0)) {
    //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // }

    //*/

    vec4 bgColor = texture2D(
        iColor,
        vec2(data.x, 0.0)
    );

    gl_FragColor = vec4(
        bgColor.rgb,
        1.0
    );

    if (data.z != 0.0) {
        vec4 color = texture2D(
            iColor,
            vec2(data.y, 0.0)
        );

        float pSmoth;
        float nSmoth;

        if (data.z == 1.0 / 255.0) { // village
            pSmoth = smoothstep(0.7, 0.7 + smoothWeight, hexCoord.z);
        } else if (data.z == 2.0 / 255.0) { // province border
            pSmoth = smoothstep(0.3, 0.3 + smoothWeight, hexCoord.z);
        } else if (data.z == 3.0 / 255.0) { // continent border
            pSmoth = smoothstep(0.2, 0.2 + smoothWeight, hexCoord.z);
        }

        nSmoth = 1.0 - pSmoth;

        color = vec4(
            (bgColor.rgb * pSmoth) + (color.rgb * nSmoth),
            1.0
        );

        gl_FragColor = color;
    }

    //*/

    // if (round(hexCoord.x) == 500.0) {
    //     color = vec4(1.0, 0.0, 1.0, 1.0);
    // } else if (round(hexCoord.x) == 501.0) {
    //     color = vec4(0.0, 0.0, 1.0, 1.0);
    // } else if (round(hexCoord.y) == 500.0) {
    //     color = vec4(1.0, 0.0, 0.0, 1.0);
    // } else if (round(hexCoord.y) == 501.0) {
    //     color = vec4(1.0, 1.0, 0.0, 1.0);
    // }
}
