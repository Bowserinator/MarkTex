import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import markedImages from 'marked-images';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import doc from './document.js';
import config from './config.js';
import { AbstractExtension } from './abstract-extension.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Settings
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    xhtml: false,

    headerIds: true,
    headerPrefix: 'header-'
});

// TODO

// Load all extensions
const extensionPaths: Array<string> = [];

fs.readdirSync(path.join(__dirname, './extensions')).forEach(async file => {
    if (!file.endsWith('.js')) return;
    extensionPaths.push(path.join(__dirname, './extensions', file));
});

const extensions: Array<AbstractExtension> = await extensionPaths.reduce(async (acc, file) => {
    const arr = await acc;
    const mod = await import(file);
    // @ts-expect-error
    arr.push(mod.default);
    return arr;
}, Promise.resolve([]));

extensions.sort((a, b) => a.priority - b.priority);


function loadExtension(extension: AbstractExtension) {
    if (extension.disabled) return;
    extension.marked(marked);
    marked.use({ extensions: extension.exportExtensions() });
}

extensions.forEach(loadExtension);


/**
 * Convert marktex -> html
 * @param {string} fileData Content of the .mtx file
 * @return {string} HTML Output
 */
export function parse(fileData: string) {
    doc.reset();
    const html = marked.parse(fileData);

    // Replace special HTML tags
    return html.replaceAll(
        config.tocTag,
        `<div class="toc">${doc.headers.join('<br>')}</div>`
    ).replaceAll('@newpage', '<div class="pagebreak"></div>'); // TODO: neater?
}


export function generateHTML(fileData: string, options) {
    return `
    <head>
        <link rel="stylesheet" href="http://localhost:${options.port}/css/index.css">

${extensions.map(ext => ext.htmlHeaderInject()).join('\n')}
       
        <link rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/default.min.css">
        <!--<script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js"></script>-->
    </head>

    <body>
        <div class="content">
            ${parse(fileData)}
        </div>
    </body>`;
}
