import katex from 'katex';
import config from './config.js';

/**
 * Render a latex string with a given display mode
 * @param {string} str LaTeX to render
 * @param {boolean} displayMode true if LaTeX block, false if inline
 * @return {string} HTML for rendered latex
 */
export default function renderLatex(str, displayMode) {
    return katex.renderToString(str, {
        displayMode,
        throwOnError: false,
        trust: config.trustLatex,
        strict: 'ignore'
    });
}
