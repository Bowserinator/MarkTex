import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import markedImages from 'marked-images';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { doc } from './document.js';
import config from './config.js';
import { AbstractExtension } from './abstract-extension.js';
import signale from 'signale';

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


marked.Lexer.rules.block.bullet =
            marked.Lexer.rules.block.pedantic.bullet =
            marked.Lexer.rules.block.gfm.bullet =
            marked.Lexer.rules.block.normal.bullet =
            /(?:[*+-]|[A-Za-z0-9]{1,9}[.)]|\([A-Za-z0-9]+\))/;


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

extensions.sort((a, b) => b.priority - a.priority);


function loadExtension(extension: AbstractExtension) {
    if (extension.disabled) return;
    extension.marked(marked);
    marked.use({ extensions: extension.exportExtensions() });
}

extensions.forEach(loadExtension);

const preParseExtensions = extensions.filter(ext => ext.preParse('') !== null);

// Custom renderer and tokenizer
const tokenizer = Object.assign({}, ...extensions.map(ext => ext.tokenizer()));
marked.use({ tokenizer });

const renderer = Object.assign({}, ...extensions.map(ext => ext.renderer()));
marked.use({ renderer });


/**
 * Convert marktex -> html
 * @param {string} fileData Content of the .mtx file
 * @return {string} HTML Output
 */
export function parse(fileData: string) {
    doc.reset();

    // Preparsing
    for (let ext of preParseExtensions) {
        let newFileData = ext.preParse(fileData);
        if (newFileData !== null)
            fileData = newFileData;
        else
            signale.error(`Extension ${ext.name} returned null when pre-parsing, this can only be done if the extension will ALWAYS skip the preparse step, otherwise it should return the original text`);
    }

    const html = marked.parse(fileData);

    // Replace special HTML tags
    return html.replaceAll(
        config.tocTag,
        `<div class="toc">${doc.headers.join('<br>')}</div>`
    ); // TODO: neater?
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
