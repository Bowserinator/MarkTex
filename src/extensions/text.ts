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
Small caps: ^^Small Caps^^
Oblique: //oblique//
Underline: _text_ (overrides normal markdown)
Filler: /-/ (converted to nothing, used to trick the parser)
Pagebreak: +++ (Block)
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
                    return `<ins class="text-inline-addition">${this.parser.parseInline(token.tokens)}</ins>`;
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
                    return `<del class="text-inline-deletion">${this.parser.parseInline(token.tokens)}</del>`;
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
                    return `<span class="text-inline-comment">${this.parser.parseInline(token.tokens)}</span>`;
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
                name: 'smallCaps',
                level: 'inline',
                start: /\^\^[^^]/,
                tokenMatch: /^(?:\^\^(?:[^^]+.*?)\^\^)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].substring(2, match[0].length - 2);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<span class="text-small-caps">${this.parser.parseInline(token.tokens)}</span>`;
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
                tokenMatch: /./, // Unused, ignore
                matchFunction(src: string) {
                    const match = /^(?:\| (?:.+?)(?:\n|$))/.exec(src);

                    // Prevent this from breaking tables, all other |s must
                    // be escaped in this block
                    if (match && match[0].substring(1).match(/[^\\]\|/))
                        return null;
                    return match;
                },
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
            }),
            mdExt({
                name: 'slant',
                level: 'inline',
                start: /\/\/[^/]/,
                tokenMatch: /^(?:\/\/(?:[^/]+.*?)\/\/)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].substring(2, match[0].length - 2);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<span class="text-slant">${this.parser.parseInline(token.tokens)}</span>`;
                }
            }),
            mdExt({
                name: 'underline',
                level: 'inline',
                start: /_[^_]/,
                tokenMatch: /^(?:_(?:[^_]+.*?)_)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].substring(1, match[0].length - 1);
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return `<u>${this.parser.parseInline(token.tokens)}</u>`;
                }
            }),
            mdExt({
                name: 'filler',
                level: 'inline',
                start: /\/-\//,
                tokenMatch: /^(?:\/-\/)/,
                renderer(token: any) {
                    return ``;
                }
            }),
            mdExt({
                name: 'pageBreak',
                level: 'block',
                start: /\+\+\+\n/,
                tokenMatch: /^(?:\+\+\+\n)/,
                renderer(token: any) {
                    return `\n<div class="text-pagebreak"></div>\n`;
                }
            })];
    }
}

export default new TextExtension();
