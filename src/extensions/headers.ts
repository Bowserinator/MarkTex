import { AbstractExtension } from '../abstract-extension.js';
import { mdExt } from '../util/marked-ext.js';
import { marked } from 'marked';

/**
 * Unnumbered headers
 * @author Bowserinator
 */
class HeadersExtension extends AbstractExtension {
    constructor() {
        super('headers', 'Headers', 'Builtin', `
Special headers:

*Unnumbered Headers*: Same as regular headers, but add an * after, that way
they won't be auto-numbered (but still will be added to the TOC)

Example:
    ##* Unnumbered header

*Unlisted Headers*: Same as regular headers, but won't be numbered nor will
they be added to the TOC. Add a ! after instead of a *

Example:
    ##! Unlisted header
`);
    }

    exportExtensions() {
        return [
            mdExt({
                name: 'unnumberedHeader',
                level: 'block',
                start: /#{1,6}\*/m,
                tokenMatch: /^(?:#{1,6}\* (?:.+?)(?:\n|$))/,
                tokenRules(token, src, tokens, match) {
                    const split = match[0].split(/ (.*)/s);
                    token.text = split[1];
                    token.level = split[0].length - 1;
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return marked.Renderer.prototype.heading.apply(marked, [this.parser.parseInline(token.tokens),
                        token.level, token.raw, new marked.Slugger()]);
                }
            }),
            mdExt({
                name: 'unlistedHeader',
                level: 'block',
                start: /#{1,6}!/m,
                tokenMatch: /^(?:#{1,6}! (?:.+?)(?:\n|$))/,
                tokenRules(token, src, tokens, match) {
                    const split = match[0].split(/ (.*)/s);
                    token.text = split[1];
                    token.level = split[0].length - 1;
                },
                inline(lexer, token) {
                    lexer.inline(token.text, token.tokens);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return marked.Renderer.prototype.heading.apply(marked, [this.parser.parseInline(token.tokens),
                        token.level, token.raw, new marked.Slugger()]);
                }
            })];
    }
}

export default new HeadersExtension();
