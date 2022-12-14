import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import markedImages from 'marked-images';

import {
    asciiMathBlock, asciiMathInline, latexMathBlock,
    latexMathInline, smallInline, unnumberedHeader, TOC,
    footnoteRef, footnote
} from './components/index.js';
import doc from './document.js';
import config from './config.js';

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


// Custom renderer
const renderer = {
    // Wrap inline code blocks to have custom CSS
    codespan(code) {
        return `<code class="inline-code-block">${code}</code>`;
    },
    // Add headers to document while parsing
    heading(text, level, raw, slugger) {
        let extra = level > 1 ? doc.addHeader(level) + '. ' : '';
        doc.addHeaderName(`${extra}${text}`, level);
        return marked.Renderer.prototype.heading.apply(this,
            [`${extra}${text}`, level, `${extra}${raw}`, slugger]);
    }
};
marked.use({ renderer });

// Ensure block extensions go after their inline ver (higher priority)
// Ie, $$latex$$ must go after (have higher priority) than $latex$
marked.use({
    extensions: [
        asciiMathInline, asciiMathBlock, latexMathInline,
        latexMathBlock, smallInline, unnumberedHeader, TOC,
        footnoteRef, footnote
    ]
});

// Additional image features (size + attribute control)
marked.use(markedImages({ xhtml: false }));

/**
 * Convert marktex -> html
 * @param {string} fileData Content of the .mtx file
 * @return {string} HTML Output
 */
export function parse(fileData) {
    doc.reset();
    const html = marked.parse(fileData);

    // Replace special HTML tags
    return html.replaceAll(
        config.tocTag,
        `<div class="toc">${doc.headers.join('<br>')}</div>`
    );
}
