import katex from 'katex';
import config from '../config.js';

/**
 * Render a latex string with a given display mode
 * @param str LaTeX to render
 * @param displayMode true if LaTeX block, false if inline
 * @return HTML for rendered latex
 */
export default function renderLatex(str: string, displayMode: boolean): string {
    let html = katex.renderToString(str, {
        displayMode,
        throwOnError: false,
        trust: config.trustLatex,
        strict: 'ignore'
    });
    if (!displayMode)
        html = html.replace('class="katex"', 'class="katex katex-inline"');
    return html;
}
