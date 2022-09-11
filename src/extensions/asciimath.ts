import { AbstractExtension } from '../abstract-extension.js';
import renderLatex from '../util/latex.js';

import asciimath2latex from 'asciimath-to-latex';
import { mdExt } from '../util/marked-ext.js';

/**
 * ASCII Math code blocks
 * Requires the builtin LaTeX extension to also be loaded
 * for proper math display
 * @author Bowserinator
 */
class AsciiMathExtension extends AbstractExtension {
    constructor() {
        super('asciimath', 'ASCIIMath', 'Builtin', `
ASCIIMath inline and block math blocks.

Code block: Usage: Surround with @@
    Example:
    @@
    x^2 + 2x + 1
    @@

Inline: Surround with @
    Example:
    This is some @x^2 + 1@ math
`);
    }

    exportExtensions() {
        return [
            mdExt({
                name: 'asciiMathInline',
                level: 'inline',
                start: /@[^@]/,
                tokenMatch: /^(?:@(?:.+?)@)+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(1, match[0].length - 1);
                },
                renderer(token: any) {
                    // @ts-expect-error
                    return renderLatex(asciimath2latex.default(token.text), false);
                }
            }),
            mdExt({
                name: 'asciiMathBlock',
                level: 'block',
                start: /^@@[^@]/m,
                tokenMatch: /^(?:@@(?:[\s\S]+?)@@)+?/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(2, match[0].length - 2);
                },
                renderer(token: any) {
                    // TODO: use another thing
                    // Preserve original newlines: split, parse each separately then rejoin
                    // with the LaTeX newline
                    const orgText = token.text.split('\n');
                    // @ts-expect-error
                    const asciiText = orgText.map(asciimath2latex.default).join('\\newline');
                    return renderLatex(asciiText, true);
                }
            })];
    }
}

export default new AsciiMathExtension();
