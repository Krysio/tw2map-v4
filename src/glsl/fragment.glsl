#ifdef GL_ES
    precision highp float;
    precision highp int;
#endif
#define PI 3.1415926538
#define ELEMENTS_PER_TILE 4.0

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

/*******************************/

float round(float x) { return floor(x + 0.5); }
 vec2 round(vec2 x)  { return floor(x + 0.5); }
 vec3 round(vec3 x)  { return floor(x + 0.5); }
 vec4 round(vec4 x)  { return floor(x + 0.5); }

/*******************************/

// distance to center circle {0.0 - 1.0}, 1.0 = border
float d_circle(vec2 gv) {
    gv = abs(gv);
    return sqrt(gv.x * gv.x + gv.y * gv.y) * 2.0 - 0.1;
}
// distance to center hex {0.0 - 1.0}, 1.0 = border
float d_hex(vec2 gv) {
    gv = abs(gv);
    float d = dot(gv, normalizedRadius);
	return max(gv.x, d) * 2.0;
}
float d_hexFat(vec2 gv) {
    float h = d_hex(gv);
    float c = d_circle(gv);
    return c * h + 0.1;
}
float d_squareStar(vec2 gv) {
    float h = d_hex(gv);
    float c = d_circle(gv) + 0.1;
    return max(h - 0.15, h * abs(c - h) * 40.0);
}
float d_star(vec2 gv) {
    float h = d_hex(gv);
    float c = d_circle(gv) + 0.05;
    return c + (h - c) * 2.0;
}
float d_star2(vec2 gv) {
    float h = d_hex(gv);
    float c = d_circle(gv) + 0.05;
    return c + (h - c) * 3.0;
}

float calc_neighbor(vec2 gv) {
    return atan(gv.x, gv.y);
}

vec4 hexCoords(vec2 uv) {
    vec2 a = mod(uv, radius) - halfRadius;
    vec2 b = mod(uv - halfRadius, radius) - halfRadius;
    vec2 gv = length(a) < length(b) ? a : b;

    return vec4(
        floor(uv.x - gv.x), // x
        round((uv.y - gv.y) / radius.y * 2.0), // y
        gv
    );
}
vec4 hexCoordsCircle(vec2 uv) {
    vec2 a = mod(uv, radius) - halfRadius;
    vec2 b = mod(uv - halfRadius, radius) - halfRadius;
    vec2 gv = length(a) < length(b) ? a : b;

    return vec4(gv, uv - gv);
}

/*******************************/

lowp vec4 getColor(float index, vec4 hexCoord) {
    vec4 color = texture2D(
        iData,
        vec2(
            ((hexCoord.x * ELEMENTS_PER_TILE) + index) / (1024.0 * ELEMENTS_PER_TILE),
            hexCoord.y / 1024.0
        )
    );
    if (color.a == 0.0) {
        color = texture2D(iColor, color.xy);
    }
    return color;
}

/*******************************/

mediump float getDistance(vec2 coordA, vec2 coordB, float x, float y) {
    float dy = coordA.y - y;
    float dx = coordA.x - x;

    if (mod(coordB.y - y, 2.0) == 1.0) {
        if (mod(coordB.y, 2.0) == 1.0) {
            dx = dx + 0.5;
        } else {
            dx = dx + -0.5;
        }
    }

    return sqrt(dx * dx + dy * dy * 0.75);
}

/*******************************/

void main() {
    float randSeed = 1.0;

    vec2 pxPosCentered = vec2(pixelPosition - halfResolution);
    vec2 scalar = vec2(1.0) * iSize;

    vec2 rawCorods = 
        vec2(
            pxPosCentered.x + 1000.0 * iPosition.x * iSize,
            pxPosCentered.y + 1000.0 * 0.5 * radius.y * iPosition.y * iSize
        ) / scalar;
    vec4 hexCoord = hexCoords(rawCorods);

    // dane pola
    mediump vec4 dataA;
    mediump vec4 dataB;

    lowp vec4 color1;
    lowp vec4 color2;
    lowp vec4 color3;
    bool hasColor2 = false;
    bool hasColor3 = false;
    mediump float color2Param = 0.0;
    mediump float color3Param = 0.0;

    // poza obszarem mapy

    if (hexCoord.x < 0.0
        || hexCoord.x >= 1000.0
        || hexCoord.y < 0.0
        || hexCoord.y >= 1000.0
    ) {
        dataA = vec4(0, 0, 0, 0);
    } else {
        dataA = texture2D(
            iData,
            vec2(
                (hexCoord.x * ELEMENTS_PER_TILE) / (1024.0 * ELEMENTS_PER_TILE),
                hexCoord.y / 1024.0
            )
        );
    }

    float hexDistance = d_hex(hexCoord.zw);
    vec4 color = getColor(1.0, hexCoord);
    
    //color.a = hexDistance;

    if (hexDistance > 0.9) {
        float param = atan(hexCoord.z, hexCoord.w);
        float steep = 0.0;
        vec4 secondCoord = hexCoord;
        float colorParam = 0.0;

        if (mod(hexCoord.y, 2.0) == 1.0) {
            steep = 1.0;
        }

        if (hexCoord.z > 0.0) {
            // prawo
            secondCoord.x = secondCoord.x + 1.0;
            if (param > 2.0778) {
                // gora
                secondCoord.y = secondCoord.y - 1.0;
                secondCoord.x = secondCoord.x - 1.0 + steep;
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 40.0,
                    1.0 + smoothWeight * iSize / 40.0,
                    hexDistance
                );
            } else if (param < 1.065) {
                // dol
                secondCoord.y = secondCoord.y + 1.0;
                secondCoord.x = secondCoord.x - 1.0 + steep;
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 40.0,
                    1.0 + smoothWeight * iSize / 40.0,
                    hexDistance
                );
            } else {
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 80.0,
                    1.0 + smoothWeight * iSize / 80.0,
                    hexDistance
                );
            }
        } else {
            // lewo
            secondCoord.x = secondCoord.x - 1.0;
            if (param < -2.0778) {
                // gora
                secondCoord.x = secondCoord.x + steep;
                secondCoord.y = secondCoord.y - 1.0;
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 40.0,
                    1.0 + smoothWeight * iSize / 40.0,
                    hexDistance
                );
            } else if (param > -1.065) {
                secondCoord.x = secondCoord.x + steep;
                secondCoord.y = secondCoord.y + 1.0;
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 40.0,
                    1.0 + smoothWeight * iSize / 40.0,
                    hexDistance
                );
            } else {
                colorParam = smoothstep(
                    1.0 - smoothWeight * iSize / 80.0,
                    1.0 + smoothWeight * iSize / 80.0,
                    hexDistance
                );
            }
        }

        vec4 secondColor = getColor(1.0, secondCoord);
        color = vec4(
            (secondColor.rgb * colorParam) + (color.rgb * (1.0 - colorParam)),
            1.0
        );

        // if (hexCoord.z > 0.0) {
        //     gl_FragColor = vec4(
        //         1.0,
        //         0.0,
        //         0.0,
        //         1.0
        //     );
        //     float paramA = hexCoord.w / hexCoord.z;
        //     float paramB = halfRadius.y / 1.54;
        //     if (
        //         paramA > paramB
        //     ) {
        //         // dol
        //         gl_FragColor.r = 0.0;
        //         gl_FragColor.b = 1.0;
        //     } else if (paramA > -paramB) {
        //         // srodek
        //         gl_FragColor.r = 1.0;
        //         gl_FragColor.b = 1.0;
        //     } else {
        //         // gora
        //         gl_FragColor.r = 1.0;
        //         gl_FragColor.b = 0.0;
        //     }
        // } else {
        //     gl_FragColor = vec4(
        //         0.0,
        //         1.0,
        //         0.0,
        //         1.0
        //     );
        // }
        
    } else if (dataA.z != 0.0) {
        float pSmoth = 0.0;
        float nSmoth = 0.0;

        if (
            dataA.z > 0.5 / 255.0 &&
            dataA.z < 1.5 / 255.0
        ) { // village
            hasColor2 = true;
            color2 = getColor(2.0, hexCoord);
            color2Param = smoothstep(0.7, 0.7 + smoothWeight, hexDistance);

            // TODO
            hasColor3 = true;
            color3 = getColor(3.0, hexCoord);
            color3Param = smoothstep(0.2, 0.2 + smoothWeight, d_circle(hexCoord.zw));
        } else if (
            dataA.z > 1.5 / 255.0 &&
            dataA.z < 2.5 / 255.0
        ) { // province border
            hasColor2 = true;
            color2 = getColor(2.0, hexCoord);
            color2Param = smoothstep(0.2, 0.2 + smoothWeight, d_circle(hexCoord.zw));
        } else if (
            dataA.z > 2.5 / 255.0 &&
            dataA.z < 3.5 / 255.0
        ) { // continent border
            hasColor2 = true;
            color2 = getColor(2.0, hexCoord);
            color2Param = smoothstep(0.1, 0.1 + smoothWeight, d_circle(hexCoord.zw));
        }

        if (hasColor2) {
            color = vec4(
                (color.rgb * color2Param) + (color2.rgb * (1.0 - color2Param)),
                1.0
            );
        }
        if (hasColor3) {
            color = vec4(
                (color.rgb * color3Param) + (color3.rgb * (1.0 - color3Param)),
                1.0
            );
        }

    }
    gl_FragColor = color;
}
