/**
 * Small text (Wrap with <small>)
 * Usage:
 *      ^small text^
 */
export const smallInline = {
    name: 'smallInline',
    level: 'inline',
    start(src) {
        return src.match(/\^[^^]/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^(?:\^(?:.+?)\^)+?/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'smallInline',
                raw: match[0],
                text: match[0].trim().substring(1, match[0].length - 1),
                tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
        }
    },
    renderer(token) {
        return `<small>${this.parser.parseInline(token.tokens)}</small>`;
    }
};
