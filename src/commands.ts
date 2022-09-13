
// TODO: load all commands


import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { AbstractCommand } from './abstract-command.js';
import signale from 'signale';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Load all commands
const commandPaths: Array<string> = [];

fs.readdirSync(path.join(__dirname, './commands')).forEach(async file => {
    if (!file.endsWith('.js')) return;
    commandPaths.push(path.join(__dirname, './commands', file));
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


const LBRACKET = '{';
const RBRACKET = '}';
const COMMAND_RE = /(?:@[A-Za-z0-9_-]+(\(.+\))?{)/g;

export function parseCommands(md: string): string {
    let currentIndex = 0; // Index to start indexOf
    let bracketIndices: Array<number> = []; // Array of bracket start indices not matched yet
    let nextBracket: { [K: number] : number } = {}; // Map of start index: end index | -1
    let nestLevel: { [K: number] : number } = {}; // Map of start index: nest level

    do {
        let i1 = md.indexOf(LBRACKET, currentIndex);
        let i2 = md.indexOf(RBRACKET, currentIndex);
        let nextIndex = i1 < 0 ? i2 : (i2 < 0 ? i1 : Math.min(i1, i2));

        if (nextIndex < 0) break;
        currentIndex = nextIndex + 1;

        if (md.charAt(nextIndex) === LBRACKET) { // Found left bracket
            bracketIndices.push(nextIndex);
            nextBracket[nextIndex] = 0;
            nestLevel[nextIndex] = bracketIndices.length - 1;

            for (let i of bracketIndices)
                nextBracket[i]--;
        } else { // Found right bracket
            for (let i of bracketIndices) {
                nextBracket[i]++;
                if (nextBracket[i] === 0)
                    nextBracket[i] = nextIndex;
            }
            bracketIndices = bracketIndices.filter(i => nextBracket[i] < 0);
        }
    } while (currentIndex < md.length);


    // TODO: error if mismatch

    let newMd = '';
    let i = 0;

    for (let match of md.matchAll(COMMAND_RE)) {
        if (match.index === undefined) continue;

        const cmdName = match[0].substring(1, match[0].length - 1).split('(')[0];
        const args = match[1] ? match[1].substring(1, match[1].length - 1) : '';
        const endParenIndex = nextBracket[match.index + match[0].length - 1];
        const nest = nestLevel[match.index + match[0].length - 1];

        let cmdData = md.substring(match.index + match[0].length, endParenIndex);
        cmdData = parseCommands(cmdData); // TODO: pass helper data to avoid recomputing paren


        if (nest !== 0) continue; // TODO

        const command = commands[cmdName];

        newMd += md.substring(i, match.index);
        if (command)
            newMd += `\n\n${command.startTag(args)}\n\n${command.body(args, cmdData)}\n\n${command.endTag(args)}\n\n`;
        else
            newMd += `\n\n<div style="color: red">ERROR CANNOT FIND ${cmdName}</div>\n\n`;

        i = endParenIndex + 1;
    }

    newMd += md.substring(i);

    return newMd;
}
