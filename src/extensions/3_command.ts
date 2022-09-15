import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import _matchBracket from 'find-matching-bracket';

import { AbstractExtension } from '../abstract-extension.js';
import { AbstractCommand } from '../abstract-command.js';
import { parseKeyValue } from '../util/util.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @ts-expect-error
const matchBracket = _matchBracket.default;

const CMD_RE = /^(?:@[A-Za-z0-9_-]+(\(.+\))?{)([\s\S]+)}/;

// Load all commands
const commandPaths: Array<string> = [];

fs.readdirSync(path.join(__dirname, '../commands')).forEach(async file => {
    if (!file.endsWith('.js')) return;
    commandPaths.push(path.join(__dirname, '../commands', file));
});

const commandList: Array<AbstractCommand> = await commandPaths.reduce(async (acc, file) => {
    const arr = await acc;
    const mod = await import(file);
    // @ts-expect-error
    arr.push(mod.default);
    return arr;
}, Promise.resolve([]));

const commands: { [K: string]: AbstractCommand } = {};

for (let command of commandList)
    commands[command.id] = command;

interface CommandToken {
    type: string;
    raw: string;
    tokens: Array<any>;

    cmdName: string;
    args: any;
    inner: string;
}

/**
 * Get token object
 * @param src Original source
 * @param match Match of CMD_RE
 * @param tokenType Token name
 * @return token object
 */
function tokenFromMatch(src: string, match: RegExpExecArray, tokenType: string): CommandToken {
    // Keep going forward until a matching number of { } is found
    const startParen = match.index + match[0].indexOf('{');
    const endParen = matchBracket(src, startParen);
    const raw = src.substring(match.index, endParen + 1);

    const first = match[0].match(/[{(]/);
    if (!first) throw new Error('Invalid command, missing { or (');

    const token = {
        type: tokenType,
        raw,
        tokens: [],

        cmdName: match[0].substring(1, first.index),
        args: parseKeyValue(match[1] ? match[1].substring(1, match[1].length - 1) : ''),
        inner: src.substring(startParen + 1, endParen)
    };
    return token;
}


/**
 * Command macros
 * @author Bowserinator
 */
class CommandExtension extends AbstractExtension {
    constructor() {
        super('commands', 'Commands', 'Builtin', `
Allow use of the command syntax, ie

@command_name(...args){ ... }
@command_name{ ... }

Commands can be both block or inline.
`, -98);
    }

    exportExtensions() {
        return [
            {
                name: 'commandInline',
                level: 'inline',
                start(src: string) {
                    return src.match(/@[A-Za-z0-9_-]+[({]/)?.index;
                },
                tokenizer(src: string, tokens: Array<any>) {
                    const match = CMD_RE.exec(src);
                    if (match) {
                        const token = tokenFromMatch(src, match, 'commandInline');
                        // @ts-expect-error
                        token.inner = this.lexer.inlineTokens(token.inner);
                        return token;
                    }
                },
                renderer(token: CommandToken): string {
                    const command = commands[token.cmdName];
                    if (command)
                        // @ts-expect-error
                        return command.html(token.args, this.parser.parseInline(token.inner));
                    // @ts-expect-error
                    return `\n\n<div class="error">@${token.cmdName}{${this.parser.parseInline(token.inner)}}</div>\n\n`;
                }
            },
            {
                name: 'commandBlock',
                level: 'block',
                start(src: string) {
                    return src.match(/^@[A-Za-z0-9_-]+[({]/m)?.index;
                },
                tokenizer(src: string, tokens: Array<any>) {
                    const match = CMD_RE.exec(src);
                    if (match) {
                        const token = tokenFromMatch(src, match, 'commandBlock');
                        // @ts-expect-error
                        this.lexer.blockTokens(token.inner, token.tokens);
                        return token;
                    }
                },
                renderer(token: CommandToken): string {
                    const command = commands[token.cmdName];
                    if (command)
                        // @ts-expect-error
                        return command.html(token.args, this.parser.parse(token.tokens));
                    // @ts-expect-error
                    return `\n\n<div class="error">@${token.cmdName}{${this.parser.parse(token.tokens)}}</div>\n\n`;
                }
            }
        ];
    }
}

export default new CommandExtension();
