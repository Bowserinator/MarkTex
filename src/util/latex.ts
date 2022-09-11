import katex from 'katex';
import config from '../config.js';

/**
 * Render a latex string with a given display mode
 * @param str LaTeX to render
 * @param displayMode true if LaTeX block, false if inline
 * @return HTML for rendered latex
 */
export default function renderLatex(str: string, displayMode: boolean): string {
    return katex.renderToString(str, {
        displayMode,
        throwOnError: false,
        trust: config.trustLatex,
        strict: 'ignore'
    });
}
