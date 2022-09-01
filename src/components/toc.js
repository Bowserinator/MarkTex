/**
 * Table of contents
 * Usage:
 *      [[TOC]]
 *
 * This will be replaced with a table of contents of all
 * headers in the document, including unnumbered headers
 * (Unlike LaTeX, which requires you to manually add all
 *  unnumbered headers)
 */

import config from '../config.js';

export const TOC = {
    name: 'TOC',
    level: 'inline',
    start(src) {
        return src.match(/\[\[/)?.index;
    },
    tokenizer(src, _tokens) {
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
    renderer(_token) {
        return config.tocTag;
    }
};
