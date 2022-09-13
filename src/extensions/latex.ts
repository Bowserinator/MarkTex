import { AbstractExtension } from '../abstract-extension.js';
import renderLatex from '../util/latex.js';
import { mdExt } from '../util/marked-ext.js';

/**
 * LaTeX code blocks
 * @author Bowserinator
 */
class LatexExtension extends AbstractExtension {
    constructor() {
        super('latex', 'LaTeX', 'Builtin', `
LaTeX inline and block math blocks.

Code block: Usage: Surround with $$
    Example:
    $$
    x^2 + 2x + 1
    $$

Inline: Surround with $
    Example:
    This is some $x^2 + 1$ math
`);
    }

    htmlHeaderInject() {
        return `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.1/dist/katex.min.css"
        integrity="sha384-pe7s+HmY6KvqRkrRRUr4alQJ0SkmzCft3RpK1ttGMa7qk8Abp/MEa/4wgceRHloO" crossorigin="anonymous">`;
    }

    exportExtensions() {
        return [
            mdExt({
                name: 'latexMathInline',
                level: 'inline',
                start: /\$[^$]/,
                tokenMatch: /^(?:\$(?:.+?)\$)/,
                tokenRules(token, src, tokens, match) {
                    token.text = match[0].trim().substring(1, match[0].length - 1);
                },
                renderer(token: any) {
                    return renderLatex(token.text, false);
                }
            }),
            mdExt({
                name: 'latexMathBlock',
                level: 'block',
                start: /^ {0,3}\$\$[^$]/m,
                tokenMatch: /^ {0,3}(?:\$\$(?:[\s\S]+?)\$\$)/,
                tokenRules(token, src, tokens, match) {
                    const txt = match[0].trim();
                    token.text = txt.trim().substring(2, txt.length - 2);
                },
                renderer(token: any) {
                    return renderLatex(token.text, true);
                }
            })];
    }
}

export default new LatexExtension();
