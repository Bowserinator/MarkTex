import { AbstractExtension } from '../abstract-extension.js';
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
Additions: {++added++}
Deletions: {--deleted--}
Comments: {>>comment<<}
Preserve whitespace: |     line with whitespace preserved
`);
    }

    exportExtensions() {
        return [
            mdExt({
                name: 'highlight',
                level: 'inline',
                start: /==[^=]/,
                tokenMatch: /^(?:==(?:.+?)==)/,
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
                name: 'addition',
                level: 'inline',
                start: /\{\+\+/,
                tokenMatch: /^(?:\{\+\+(?:.+?)\+\+\})/,
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
                name: 'deletion',
                level: 'inline',
                start: /\{--/,
                tokenMatch: /^(?:\{--(?:.+?)--\})/,
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
                name: 'comment',
                level: 'inline',
                start: /\{>>/,
                tokenMatch: /^(?:\{>>(?:.+?)<<\})/,
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
            }),
            mdExt({
                name: 'sub',
                level: 'inline',
                start: /~[^~]/,
                tokenMatch: /^(?:~(?:[^~]+.*?)~)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].substring(1, match[0].length - 1);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<sub>${this.parser.parseInline(token.tokens)}</sub>`;
                }
            }),
            mdExt({
                name: 'sup',
                level: 'inline',
                start: /\^[^^]/,
                tokenMatch: /^(?:\^(?:[^^]+.*?)\^)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(1, match[0].length - 1);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<sup>${this.parser.parseInline(token.tokens)}</sup>`;
                }
            }),
            mdExt({
                name: 'whitespaceBlock',
                level: 'block',
                start: /^\| /m,
                tokenMatch: /^(?:\| (?:.+?)(?:\n|$))/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim()
                        .substring(2, match[0].length)
                        .replaceAll('  ', ' &nbsp;');
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return this.parser.parseInline(token.tokens);
                }
            })];
    }
}

export default new TextExtension();
