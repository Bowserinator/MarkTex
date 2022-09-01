/**
 * Regular latex code blocks + inline code blocks
 * Rendered server-side with KaTeX
 */

import renderLatex from '../latex.js';

// Latex code block
//  Usage: $$math$$
export const latexMathBlock = {
    name: 'latexMathBlock',
    level: 'inline',
    start(src) {
        return src.match(/\$\$[^$]/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:\$\$(?:[\s\S]+?)\$\$)+?/m;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'latexMathBlock',
                raw: match[0],
                text: match[0].trim().substring(2, match[0].length - 2),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        return renderLatex(token.text, true);
    }
};

// Inline latex
//  Usage: $math$
export const latexMathInline = {
    name: 'latexMathInline',
    level: 'inline',
    start(src) {
        return src.match(/\$[^$]/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:\$(?:.+?)\$)+?/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'latexMathInline',
                raw: match[0],
                text: match[0].trim().substring(1, match[0].length - 1),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        return renderLatex(token.text, false);
    }
};
