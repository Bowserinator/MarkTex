
/**
 * Concat regex expressions. Flags will be taken from args[0]
 * @param args Regexps or strings representing regexps
 * @return Concatnated regex
 */
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
