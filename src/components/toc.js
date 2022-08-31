/**
 * Table of contents
 * Usage:
 *      [[TOC]]
 */
 export const TOC = {
    name: 'TOC',
    level: 'inline',
    start(src) { return src.match(/\[\[/)?.index; },
    tokenizer(src, tokens) {
        const rule = /^(?:\[\[TOC\]\]$)+?/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'TOC',
                raw: match[0],
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        return '<table-of-contents/>';
    }
};
