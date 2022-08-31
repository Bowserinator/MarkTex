import { parse } from './src/parse.js';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

chokidar.watch('.').on('change', (filename, stats) => {
    if (!filename || !filename.endsWith('mtxt'))
        return;
    console.log('filename provided: ' + filename);

    // Parse file and save to output
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        }

        // TODO: create out dir if no exist

        const html = `
<head>
    <link rel="stylesheet" href="./index.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.1/dist/katex.min.css" integrity="sha384-pe7s+HmY6KvqRkrRRUr4alQJ0SkmzCft3RpK1ttGMa7qk8Abp/MEa/4wgceRHloO" crossorigin="anonymous">
    <link rel="stylesheet"
    href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css">
    <!--<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js"></script>-->
</head>

<body>
    <div class="content">
        ${parse(data)}
    </div>
</body>
        `;

        fs.writeFile('./out/' + filename.replace('.mtxt', '.html'), html, errw => {
            if (errw) {
                console.error(errw);
                return;
            }
        });
    })
});
