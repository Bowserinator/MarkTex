import { AbstractExtension } from '../abstract-extension.js';
import { Marked } from '../types.js';


/**
 * Override / Extend basic markedjs features
 * @author Bowserinator
 */
class OverrideExtension extends AbstractExtension {
    constructor() {
        super('1_override', 'Override', 'Builtin', `
Override basic markedjs extensions
`, -100);
    }

    marked(marked: Marked) {
        // TODO
    }
}

export default new OverrideExtension();
