



export function concatRe(...args: Array<RegExp | string>) {
    let sources = args.map(s => s instanceof RegExp ? s.source : s);
    let flags = '';
    let r1 = args[0];
    if (r1 instanceof RegExp)
        flags = (r1.global ? 'g' : '') +
            (r1.ignoreCase ? 'i' : '') +
            (r1.multiline ? 'm' : '');

    return new RegExp(sources.reduce((a, b) => a + b), flags);
}
