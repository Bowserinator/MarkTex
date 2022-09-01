import { marked } from 'marked';

/**
 * Unnumbered header
 * Usage:
 *      ##...* Header
 * Example:
 *  ##* This header won't automatically have a number prepended
 */
export const unnumberedHeader = {
    name: 'unnumberedHeader',
    level: 'inline',
    start(src) {
        return src.match(/#/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:#{1,6}\* (?:.+?)$)+?/;
        const match = rule.exec(src);
        if (match) {
            // Split on first space
            const split = match[0].split(/ (.*)/s);
            const token = {
                type: 'unnumberedHeader',
                raw: match[0],
                level: split[0].length - 1,
                text: split[1],
                tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
        }
    },
    renderer(token) {
        return marked.Renderer.prototype.heading.apply(marked,
            [this.parser.parseInline(token.tokens), token.level, token.raw, new marked.Slugger()]);
    }
};
