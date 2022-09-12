

import { AbstractCommand } from '../abstract-command.js';

/**
 * Center align text and images
 * @author Bowserinator
 */
class CenterCommand extends AbstractCommand {
    constructor() {
        super('center', 'Center', 'Builtin', `
Center text and images
`);
    }

    startTag(args: { [K: string]: any }) {
        return '<div class="p-no-margin" style="text-align: center">';
    }

    endTag(args: { [K: string]: any }) {
        return '</div>';
    }
}

export default new CenterCommand();
