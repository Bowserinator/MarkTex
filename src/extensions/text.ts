import { AbstractExtension } from '../abstract-extension.js';
import renderLatex from '../util/latex.js';

import asciimath2latex from 'asciimath-to-latex';
import { mdExt } from '../util/marked-ext.js';

/**
 * Various Typography additions
 * @author Bowserinator
 */
class TextExtension extends AbstractExtension {
    constructor() {
        super('text', 'Text', 'Builtin', `
More text formatting options

Superscript: ^super^
Subscript: ~sub~
Highlight: ==highlight==  (html <mark>)
Emojis: :emoji_name:
Task lists: - [x] test
Page break: +++
Sub in metadata: [%key]
Abbreviations: *[HTML]: HyperText Markup Language
    Will auto add <abbr> data in text
Additions: {++added++}
Deletions: {--deleted--}
Comments: {>>wtf<<}
Preserve whitespace: |     line with whitespace preserved
Color: TODO
`);
    }

    exportExtensions() {
        return [
            mdExt({
                name: 'highlightInline',
                level: 'inline',
                start: /==[^=]/,
                tokenMatch: /^(?:==(?:.+?)==)+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(2, match[0].length - 2);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
                }
            }),
            mdExt({
                name: 'additionsInline',
                level: 'inline',
                start: /\{\+\+/,
                tokenMatch: /^(?:\{\+\+(?:.+?)\+\+\})+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(3, match[0].length - 3);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<span class="inline-addition">${this.parser.parseInline(token.tokens)}</span>`;
                }
            }),
            mdExt({
                name: 'deletionsInline',
                level: 'inline',
                start: /\{--/,
                tokenMatch: /^(?:\{--(?:.+?)--\})+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(3, match[0].length - 3);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<span class="inline-deletion">${this.parser.parseInline(token.tokens)}</span>`;
                }
            }),
            mdExt({
                name: 'commentsInline',
                level: 'inline',
                start: /\{>>/,
                tokenMatch: /^(?:\{>>(?:.+?)<<\})+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(3, match[0].length - 3);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<span class="inline-comment">${this.parser.parseInline(token.tokens)}</span>`;
                }
            })];
    }
}

export default new TextExtension();
