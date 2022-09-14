
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


/**
 * Convert str to object
 * @param str Comma separated key value pair, ie a=b,c=d
 */
export function parseKeyValue(str: string) {
    let r: any = {};
    for (let line of str.split(',')) {
        let pair = line.split('=');
        if (pair.length === 1)
            r[pair[0]] = true;
        else
            r[pair[0]] = pair[1];
    }
    return r;
}


/**
 * Convert tuple -> array
 * @param str A tuple string, ie '(a, b)'
 * @return Array of each item, ie ['a', 'b']
 */
export function detuple(str: string) {
    str = str.trim();
    return str.substring(1, str.length - 1).split(',');
}
