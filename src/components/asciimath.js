/**
 * Asciimath code blocks + inline code blocks
 * Asciimath is first converted to latex then rendered
 * with KaTeX
 */

import asciimath2latex from 'asciimath-to-latex';
import renderLatex from '../latex.js';

// Code block:
//  Usage: @@block@@
//  Note: level is 'inline', otherwise you
//        can't use @@ in some code blocks
export const asciiMathBlock = {
    name: 'asciiMathBlock',
    level: 'inline',
    start(src) {
        return src.match(/@@[^@]/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:@@(?:[\s\S]+?)@@)+?/m;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'asciiMathBlock',
                raw: match[0],
                text: match[0].trim().substring(2, match[0].length - 2),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        // Preserve original newlines: split, parse each separately then rejoin
        // with the LaTeX newline
        const orgText = token.text.split('\n');
        const asciiText = orgText.map(asciimath2latex.default).join('\\newline');
        return renderLatex(asciiText, true);
    }
};

// Inline block
//  Usage: @math@
export const asciiMathInline = {
    name: 'asciiMathInline',
    level: 'inline',
    start(src) {
        return src.match(/@[^@]/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:@(?:.+?)@)+?/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'asciiMathInline',
                raw: match[0],
                text: match[0].trim().substring(1, match[0].length - 1),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        return renderLatex(asciimath2latex.default(token.text), false);
    }
};
