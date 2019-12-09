import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

// import fs from 'fs';
// import path from 'path';

/******************************/

const DIR_OUTPUT = './dest';

// function myPlugin() {
//     return {
//         name: 'my-plugin',
//         resolveId(id) {
//             return null;
//         },
//         load(id) {
//             // code-points.mem
//             if (id.includes(`saslprep${ path.sep }lib${ path.sep }memory-code-points.js`)) {
//                 let code = fs.readFileSync(id, 'utf8');

//                 code = code.replace('../code-points.mem', './lib/saslprep/code-points.mem');

//                 if (!fs.existsSync(`${ DIR_OUTPUT }/lib`)) {
//                     fs.mkdirSync(`${ DIR_OUTPUT }/lib`);
//                 }
//                 if (!fs.existsSync(`${ DIR_OUTPUT }/lib/saslprep`)) {
//                     fs.mkdirSync(`${ DIR_OUTPUT }/lib/saslprep`);
//                 }
//                 fs.copyFileSync(
//                     id.replace(
//                         `lib${ path.sep }memory-code-points.js`,
//                         'code-points.mem'
//                     ),
//                     `${ DIR_OUTPUT }/lib/saslprep/code-points.mem`
//                 );

//                 return code;
//             }

//             return null;
//         }
//     };
// }

/******************************/

export default {
    input: 'index.js',
    output: {
        file: `${ DIR_OUTPUT }/tw2siteServer.js`,
        format: 'cjs'
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            ignore: ['bufferutil', 'utf-8-validate', 'supports-color']
        }),
        typescript({
            typescript: require('typescript')
        }),
        json()
    ],
    external: [
        'path', 'url', 'http', 'https', 'fs', 'util', 'events', 'buffer',
        'net', 'querystring', 'crypto', 'stream', 'tty', 'zlib', 'string_decoder', 'child_process',
        'mongoose'
    ]
};
