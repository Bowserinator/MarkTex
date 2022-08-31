import { marked } from 'marked';
import { asciiMathBlock, asciiMathInline, latexMathBlock,
    latexMathInline, smallInline, unnumberedHeader, TOC } from './components/index.js';
import hljs from 'highlight.js/lib/common';
import markedImages from 'marked-images';
import doc from './document.js';

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
    smartypants: false,
    xhtml: false
});

// Override function
const renderer = {
    codespan(code) {
        return `<code class="inline-code-block">${code}</code>`;
    },
    heading(text, level, raw, slugger) {
        let extra = level > 1 ? doc.addHeader(level) + '. ' : '';
        doc.addHeaderName(`${extra}${text}`, level);

        return `<h${level}>${extra}${text}</h${level}>`
    }
};

marked.use({ renderer });

// Math highlight, ensure block extensions go after their inline ver (higher priority)
marked.use({ extensions: [asciiMathInline, asciiMathBlock, latexMathInline, latexMathBlock, smallInline, unnumberedHeader, TOC] });

marked.use(markedImages({
    xhtml: false
}));


export function parse(fileData) {
    doc.reset();
    return marked.parse(fileData).replaceAll(
        '<table-of-contents/>',
`
<div class="toc">
${doc.headers.join('<br>')}
</div>`
    );
}
