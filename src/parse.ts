import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import markedImages from 'marked-images';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import doc from './document.js';
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

extensions.sort((a, b) => a.priority - b.priority);


function loadExtension(extension: AbstractExtension) {
    if (extension.disabled) return;
    extension.marked(marked);
    marked.use({ extensions: extension.exportExtensions() });
}

extensions.forEach(loadExtension);

const preParseExtensions = extensions.filter(ext => ext.preParse('') !== null);


// Custom renderer
const tokenizer = {
    list(src) {
        let cap = this.rules.block.list.exec(src);
        if (cap) {
            let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
                line, nextLine, rawLine, itemContents, endEarly;

            let bull = cap[1].trim();
            const isordered = bull.length > 1;

            const list = {
                type: 'list',
                raw: '',
                ordered: isordered,
                start: isordered ? +bull.slice(0, -1) : '',
                loose: false,
                items: []
            };

            bull = isordered ? `[A-Za-z0-9]{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

            if (this.options.pedantic)
                bull = isordered ? bull : '[*+-]';


            // Get next list item
            const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);

            // Check if current bullet point can start a new List Item
            while (src) {
                endEarly = false;
                if (!(cap = itemRegex.exec(src)))
                    break;


                if (this.rules.block.hr.test(src))  // End list if bullet was actually HR (possibly move into itemRegex?)
                    break;


                raw = cap[0];
                src = src.substring(raw.length);

                line = cap[2].split('\n', 1)[0];
                nextLine = src.split('\n', 1)[0];

                if (this.options.pedantic) {
                    indent = 2;
                    itemContents = line.trimLeft();
                } else {
                    indent = cap[2].search(/[^ ]/); // Find first non-space char
                    indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
                    itemContents = line.slice(indent);
                    indent += cap[1].length;
                }

                blankLine = false;

                if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
                    raw += nextLine + '\n';
                    src = src.substring(nextLine.length + 1);
                    endEarly = true;
                }

                if (!endEarly) {
                    const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|[A-Za-z0-9]{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`);
                    const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
                    const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
                    const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);

                    // Check if following lines should be included in List Item
                    while (src) {
                        rawLine = src.split('\n', 1)[0];
                        line = rawLine;

                        // Re-align to follow commonmark nesting rules
                        if (this.options.pedantic)
                            line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');


                        // End list item if found code fences
                        if (fencesBeginRegex.test(line))
                            break;


                        // End list item if found start of new heading
                        if (headingBeginRegex.test(line))
                            break;


                        // End list item if found start of new bullet
                        if (nextBulletRegex.test(line))
                            break;


                        // Horizontal rule found
                        if (hrRegex.test(src))
                            break;


                        if (line.search(/[^ ]/) >= indent || !line.trim())  // Dedent if possible
                            itemContents += '\n' + line.slice(indent);
                        else if (!blankLine)  // Until blank line, item doesn't need indentation
                            itemContents += '\n' + line;
                        else  // Otherwise, improper indentation ends this item
                            break;


                        if (!blankLine && !line.trim())  // Check if current line is blank
                            blankLine = true;


                        raw += rawLine + '\n';
                        src = src.substring(rawLine.length + 1);
                    }
                }

                if (!list.loose)
                // If the previous item ended with a blank line, the list is loose
                    if (endsWithBlankLine)
                        list.loose = true;
                    else if (/\n *\n *$/.test(raw))
                        endsWithBlankLine = true;


                // Check for task list items
                if (this.options.gfm) {
                    istask = /^\[[ xX]\] /.exec(itemContents);
                    if (istask) {
                        ischecked = istask[0] !== '[ ] ';
                        itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
                    }
                }

                list.items.push({
                    type: 'list_item',
                    raw,
                    task: !!istask,
                    checked: ischecked,
                    loose: false,
                    text: itemContents
                });

                list.raw += raw;
            }

            // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
            list.items[list.items.length - 1].raw = raw.trimRight();
            list.items[list.items.length - 1].text = itemContents.trimRight();
            list.raw = list.raw.trimRight();

            const l = list.items.length;

            // Item child tokens handled here at end because we needed to have the final item to trim it first
            for (i = 0; i < l; i++) {
                this.lexer.state.top = false;
                list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
                const spacers = list.items[i].tokens.filter(t => t.type === 'space');
                const hasMultipleLineBreaks = spacers.every(t => {
                    const chars = t.raw.split('');
                    let lineBreaks = 0;
                    for (const char of chars) {
                        if (char === '\n')
                            lineBreaks += 1;

                        if (lineBreaks > 1)
                            return true;
                    }

                    return false;
                });

                if (!list.loose && spacers.length && hasMultipleLineBreaks) {
                    // Having a single line break doesn't mean a list is loose. A single line break is terminating the last list item
                    list.loose = true;
                    list.items[i].loose = true;
                }
            }

            return list;
        }
    }
};
marked.use({ tokenizer });


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
