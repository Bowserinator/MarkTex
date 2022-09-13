// @ts-nocheck
import { AbstractExtension } from '../abstract-extension.js';
import { Marked } from '../types.js';
import { concatRe } from '../util/util.js';

const ROMAN_RE = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const BULLET_RE = /(?:[*+-]|[A-Za-z0-9]{1,9}[.)]|\([A-Za-z0-9]+\))/;
const LIST_RE = concatRe('^( {0,3}', BULLET_RE, ')([ \t][^\n]+?)?(?:\n|$)');


/**
 * Parse bullet text to get type
 * @param bulletText Start bullet text, ie '+' or 'a.'
 * @return Object for bullet numbering type + start index
 */
function parseBullet(bulletText): {
    type: string;
    start: number;
} {
    if (!bulletText)
        return { type: null, start: '' };

    let formatType = '';
    if (bulletText.startsWith('(') && bulletText.endsWith(')')) // (a)
        formatType = 'paren2';
    else if (bulletText.endsWith(')')) // a)
        formatType = 'paren';
    else if (bulletText.endsWith('.')) // a.
        formatType = 'period';
    else
        throw new Error(`Unknown format type for bullet ${bulletText}`);

    bulletText = formatType === 'paren2' ? bulletText.slice(1, -1) : bulletText.slice(0, -1);

    // Try to get a number
    let start = +bulletText;
    if (!Number.isNaN(start))
        return { start, type: 'number-' + formatType };

    // TODO: convert numbers

    // Lowercase
    if (bulletText.toLowerCase() === bulletText)
        // Lowercase roman
        if (ROMAN_RE.test(bulletText.toUpperCase()))
            return { start: 1, type: 'lower-roman-' + formatType }; // TODO: roman -> number
        // Lower alpha
        else if (/[a-z]+/.test(bulletText))
            return { start: 1, type: 'lower-alpha-' + formatType };

    // Uppercase
    if (bulletText.toUpperCase() === bulletText)
        // Upper roman
        if (ROMAN_RE.test(bulletText))
            return { start: 1, type: 'upper-roman-' + formatType };
        // Upper alpha
        else if (/[A-Z]+/.test(bulletText))
            return { start: 1, type: 'upper-alpha-' + formatType };

    throw new Error(`Unknown bullet type for bullet ${bulletText}`);
}


interface ListItem {
    type: string;
    raw: string;
    task: boolean;
    checked?: boolean;
    loose: boolean;
    text: string;
    tokens?: Array<any>;
}

interface ListType {
    type: string;
    raw: string;
    bulletText: string;
    start: string | number;
    loose: boolean;
    items: Array<ListItem>;
}


/**
 * Extend markedjs lists
 * @author Bowserinator
 */
class ListExtension extends AbstractExtension {
    constructor() {
        super('2_lists', 'Lists', 'Builtin', `
Extend markedjs lists to allow for more bullet types, namely:
    alphanumeric)
    (alphanumeric)
    alphanumeric.

Ideally it would only allow alpha OR numeric but a lot of the
RegExps were hardcoded and I'm not going back and changing them.
`, -99);
    }

    marked(marked: Marked) {
        marked.Lexer.rules.block.bullet =
            marked.Lexer.rules.block.pedantic.bullet =
            marked.Lexer.rules.block.gfm.bullet =
            marked.Lexer.rules.block.normal.bullet =
            BULLET_RE;
        marked.Lexer.rules.listItemStart =
            marked.Lexer.rules.block.gfm.listItemStart =
            marked.Lexer.rules.block.normal.listItemStart =
            concatRe(/^( *)/, BULLET_RE, / */);

        marked.Lexer.rules.block.list =
        marked.Lexer.rules.block.gfm.list =
        marked.Lexer.rules.block.normal.list =
            LIST_RE;
    }

    renderer() {
        return {
            list(body: string, bulletType: string, start: number) {
                const type = bulletType ? 'ol' : 'ul';
                const listStyle = bulletType ? ` class="${bulletType}"` : '';
                const startat = (bulletType && start && start !== 1) ? (` start="${start}"`) : '';
                return `<${type}${startat}${listStyle}>\n${body}</${type}>\n`;
            }
        };
    }

    tokenizer() {
        return {
            // This is taken directly from marked's list tokenizer
            // but with modified regexps
            // and ordered is no longer boolean (replaced with
            // the bullet prefix in the md as a string)
            list(src: string): object | undefined {
                let cap = this.rules.block.list.exec(src);
                if (cap) {
                    let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
                        line, nextLine, rawLine, itemContents, endEarly;

                    let bull = cap[1].trim();
                    const bulletText = bull.length > 1 ? bull : null;

                    // TODO: start shouldn't assume numeric
                    const bulletData = parseBullet(bulletText);
                    const list: ListType = {
                        type: 'list',
                        raw: '',
                        ordered: bulletData.type,
                        start: bulletData.start,
                        loose: false,
                        items: []
                    };

                    bull = bulletText ? (bulletText.startsWith('(') ? '\\(' : '') + `[A-Za-z0-9]{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
                    if (this.options.pedantic)
                        bull = bulletText ? bull : '[*+-]';

                    // Get next list item
                    const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);

                    // Check if current bullet point can start a new List Item
                    while (src) {
                        endEarly = false;
                        if (!(cap = itemRegex.exec(src)))
                            break;

                        // End list if bullet was actually HR (possibly move into itemRegex?)
                        if (this.rules.block.hr.test(src))
                            break;

                        raw = cap[0];
                        src = src.substring(raw.length);

                        line = cap[2].split('\n', 1)[0];
                        nextLine = src.split('\n', 1)[0];

                        if (this.options.pedantic) {
                            indent = 2;
                            itemContents = line.trimLeft();
                        } else {
                            indent = cap[2].search(/[^ ]/); // Find first non-space char
                            // Treat indented code blocks (> 4 spaces) as having only 1 indent
                            indent = indent > 4 ? 1 : indent;
                            itemContents = line.slice(indent);
                            indent += cap[1].length;
                        }

                        blankLine = false;

                        if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
                            raw += nextLine + '\n';
                            src = src.substring(nextLine.length + 1);
                            endEarly = true;
                        }

                        if (!endEarly) {
                            const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\(*[A-Za-z0-9]{1,9}[.)])((?: [^\\n]*)?(?:\\n|$))`);
                            const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
                            const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
                            const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);

                            // Check if following lines should be included in List Item
                            while (src) {
                                rawLine = src.split('\n', 1)[0];
                                line = rawLine;

                                // Re-align to follow commonmark nesting rules
                                if (this.options.pedantic)
                                    line = line.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');

                                // End list item if found code fences
                                if (fencesBeginRegex.test(line))
                                    break;

                                // End list item if found start of new heading
                                if (headingBeginRegex.test(line))
                                    break;

                                // End list item if found start of new bullet
                                if (nextBulletRegex.test(line))
                                    break;

                                // Horizontal rule found
                                if (hrRegex.test(src))
                                    break;

                                if (line.search(/[^ ]/) >= indent || !line.trim())  // Dedent if possible
                                    itemContents += '\n' + line.slice(indent);
                                else if (!blankLine)  // Until blank line, item doesn't need indentation
                                    itemContents += '\n' + line;
                                else  // Otherwise, improper indentation ends this item
                                    break;

                                if (!blankLine && !line.trim())  // Check if current line is blank
                                    blankLine = true;

                                raw += rawLine + '\n';
                                src = src.substring(rawLine.length + 1);
                            }
                        }

                        if (!list.loose)
                        // If the previous item ended with a blank line, the list is loose
                            if (endsWithBlankLine)
                                list.loose = true;
                            else if (/\n *\n *$/.test(raw))
                                endsWithBlankLine = true;

                        // Check for task list items
                        if (this.options.gfm) {
                            istask = /^\[[ xX]\] /.exec(itemContents);
                            if (istask) {
                                ischecked = istask[0] !== '[ ] ';
                                itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
                            }
                        }

                        list.items.push({
                            type: 'list_item',
                            raw,
                            task: !!istask,
                            checked: ischecked,
                            loose: false,
                            text: itemContents
                        });

                        list.raw += raw;
                    }

                    // Do not consume newlines at end of final item. Alternatively, make
                    // itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
                    list.items[list.items.length - 1].raw = raw.trimRight();
                    list.items[list.items.length - 1].text = itemContents.trimRight();
                    list.raw = list.raw.trimRight();

                    const l = list.items.length;

                    // Item child tokens handled here at end because we needed to have the final item to trim it first
                    for (i = 0; i < l; i++) {
                        this.lexer.state.top = false;
                        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);

                        const spacers = list.items[i].tokens.filter(t => t.type === 'space');
                        const hasMultipleLineBreaks = spacers.every(t => {
                            const chars = t.raw.split('');
                            let lineBreaks = 0;
                            for (const char of chars) {
                                if (char === '\n')
                                    lineBreaks += 1;
                                if (lineBreaks > 1)
                                    return true;
                            }
                            return false;
                        });

                        if (!list.loose && spacers.length && hasMultipleLineBreaks) {
                            // Having a single line break doesn't mean a list is loose.
                            // A single line break is terminating the last list item
                            list.loose = true;
                            list.items[i].loose = true;
                        }
                    }
                    return list;
                }
            }
        };
    }
}

export default new ListExtension();
