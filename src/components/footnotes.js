export const footnote = {
    name: 'footnote',
    level: 'inline',
    start(src) {
        return src.match(/\[\^/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^\[\^([^\]]+)\]:((?:[\s\S](?<!\n\n|\n\r\n))*)/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'footnote',
                raw: match[0],
                ref: match[0].substring(2, match[0].indexOf(':') - 1),
                text: match[0].substring(match[0].indexOf(':') + 1),
                tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
        }
    },
    renderer(token) {
        return `
        <div class="footnote" id="footnote-${token.ref}">
            <div>${token.ref}.</div>
            <div>
                ${this.parser.parseInline(token.tokens).trim().replaceAll('\n', '<br>')}
                <a href="#footnote-ref-${token.ref}">↩</a>
            </div>
        </div>`;
    }
};


// A footnote reference in text
//   Usage: Some footnote[^1] and[^2] here
export const footnoteRef = {
    name: 'footnoteRef',
    level: 'inline',
    start(src) {
        return src.match(/\[\^/)?.index;
    },
    tokenizer(src, _tokens) {
        const rule = /^\[\^([^\]]+)\]/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'footnoteRef',
                raw: match[0],
                text: match[0].substring(2, match[0].length - 1),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        return `<sup><small> <a id="footnote-ref-${token.text}" href="#footnote-${token.text}">${token.text}</a></small></sup>`;
    }
};
