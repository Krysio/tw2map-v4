#version 300 es

precision mediump float;

in vec2 corner;
in vec2 pixelPosition;
in float smoothWeight;

out vec4 outColor;

uniform float iTime;
uniform float iSize;
uniform vec2 iPosition;
uniform vec2 iResolution;
uniform mediump usampler2D iData;
uniform lowp usampler2D iColor;

float randSeed;

// float round(float x) { return floor(x + 0.5); }
//  vec2 round(vec2 x)  { return floor(x + 0.5); }
//  vec3 round(vec3 x)  { return floor(x + 0.5); }
//  vec4 round(vec4 x)  { return floor(x + 0.5); }

float rand(vec2 co){
    randSeed++;
    return fract(sin(dot(co.xy + iTime + randSeed, vec2(12.9898,78.233))) * 43758.5453);
}

float hexDist(vec2 p) {
    p = abs(p);
    float d = dot(p, normalize(vec2(1.0, 1.7)));
	return max(p.x, d);
}

vec4 hexCoords(vec2 uv) {
    vec2 r = vec2(1.0, 1.7);
    vec2 h = 0.5 * r;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    vec2 gv = length(a) < length(b) ? a : b;

    return vec4(
        (uv.x - gv.x) * 2.0, // x
        (uv.y - gv.y) / 1.7 * 2.0, // y
        hexDist(gv) * 2.0, // distance to center {0.0 - 1.0}, 1.0 = border
        0.0//atan(gv.x, gv.y) // radian
    );
}



void main() {
    randSeed = 1.0;

    // vec2 hexSize = vec2(10.0);
    // vec2 hexSizeHalf = hexSize * 0.5;

    // float hexPosYMod;
    // float hexPosXMod;
    // float step = 0.0;
    // vec2 hexCoord;

    // hexPosYMod = mod(corner.y, hexSize.y);
    // if (mod(corner.y, hexSize.y * 2.0) > hexSize.y) {
    //     step = hexSize.x / 2.0;
    // }
    // hexPosXMod = mod(corner.x + step, hexSize.x);

    // hexCoord.x = corner.x - hexPosXMod;
    // hexCoord.y = corner.y - hexPosYMod;

    vec2 halfResolution = iResolution * 0.5;
    vec2 pxPosCentered = vec2(pixelPosition - halfResolution);
    vec2 scalar = vec2(1.0) * iSize;

    vec4 hexCoord = hexCoords(vec2(
        pxPosCentered.x + 1000.0 * 0.5 * 1.0 * iPosition.x * iSize,
        pxPosCentered.y + 1000.0 * 0.5 * 1.7 * iPosition.y * iSize
    ) / scalar);

    // dane pola
    mediump uvec4 data;

    // poza obszarem mapy
    if (hexCoord.x < 0.0
        || hexCoord.x >= 1000.0
        || hexCoord.y < 0.0
        || hexCoord.y >= 1000.0
    ) {
        data = uvec4(0u, 0u, 0u, 0u);
    } else {
        data = texture(
            iData,
            hexCoord.xy / 1024.0
        );
    }

    lowp uvec4 rawBgColor = texture(
        iColor,
        vec2(float(data.x) / 1024.0, 0.0)
    );
    vec4 bgColor = vec4(
        float(rawBgColor.x) / 255.0,
        float(rawBgColor.y) / 255.0,
        float(rawBgColor.z) / 255.0,
        1.0
    );

    if (data.z == 0u // puste pole

    ) {
        outColor = bgColor;
    } else {
        lowp uvec4 rawColor = texture(
            iColor,
            vec2(float(data.y) / 1024.0, 0.0)
        );
        vec4 color = vec4(
            float(rawColor.x) / 255.0,
            float(rawColor.y) / 255.0,
            float(rawColor.z) / 255.0,
            1.0
        );

        float pSmoth;
        float nSmoth;

        if (data.z == 1u) { // village
            pSmoth = smoothstep(0.7, 0.7 + smoothWeight, hexCoord.z);
        } else if (data.z == 2u) { // province border
            pSmoth = smoothstep(0.2, 0.2 + smoothWeight, hexCoord.z);
        } else if (data.z == 3u) { // continent border
            pSmoth = smoothstep(0.3, 0.3 + smoothWeight, hexCoord.z);
        }

        nSmoth = 1.0 - pSmoth;

        color = vec4(
            (bgColor.rgb * pSmoth) + (color.rgb * nSmoth),
            1.0
        );

        // if (hexCoord.z < 0.99) {
        //     color = vec4(0.0, 0.0, 0.0, 1.0);
        // }

        outColor = color;
    }

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
