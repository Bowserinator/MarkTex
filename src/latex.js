import katex from 'katex';

export default function renderLatex(str, displayMode) {
    return katex.renderToString(str, {
        displayMode,
        throwOnError: false,
        trust: true,
        strict: 'ignore'
    });
}
