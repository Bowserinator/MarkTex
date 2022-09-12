

import { AbstractCommand } from '../abstract-command.js';

// TODO: everything here

/**
 * Center align text and images
 * @author Bowserinator
 */
class CenterCommand extends AbstractCommand {
    constructor() {
        super('large', 'Center', 'Builtin', `
Center text and images
`);
    }

    startTag(args: { [K: string]: any }) {
        return '<div style="font-size:1.25em">';
    }

    endTag(args: { [K: string]: any }) {
        return '</div>';
    }
}

export default new CenterCommand();
