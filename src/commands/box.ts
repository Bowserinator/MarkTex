

import { AbstractCommand } from '../abstract-command.js';
import { detuple } from '../util/util.js';

/**
 * Put a box around text.
 * @author Bowserinator
 */
class BoxCommand extends AbstractCommand {
    constructor() {
        super('box', 'Box', 'Builtin', `
Put a box around text

Supported arguments:
    border:  string, ie 1px solid gray (css border property)
    bg:      string, ie gray (css color)
    size:    tuple, ie (10px, 10px)
    color:   string, ie gray (text color, css color)
`);
    }

    // TODO: padding

    startTag(args: { [K: string]: any }) {
        let styleArgs: any = {
            border: '2px solid black'
        };
        if (args.border) styleArgs.border = args.border;
        if (args.bg) styleArgs.background = args.bg;
        if (args.color) styleArgs.color = args.color;
        if (args.size) {
            let size = detuple(args.size);
            styleArgs.width = size[0];
            styleArgs.height = size[1];
        }

        const style = Object.keys(styleArgs).map(k => `${k}:${styleArgs[k]}`).join(';');
        return `<span class="cmd-box" style="${style}">`;
    }

    endTag(args: { [K: string]: any }) {
        return '</span>';
    }
}

export default new BoxCommand();
