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
        
        marked.Lexer.rules.block.bullet =
            marked.Lexer.rules.block.pedantic.bullet =
            marked.Lexer.rules.block.gfm.bullet = 
            marked.Lexer.rules.block.normal.bullet =
            /(?:[*+-]|[A-Za-z0-9]{1,9}[.)]|\([A-Za-z0-9]+\))/;
        marked.Lexer.rules.listItemStart =
            marked.Lexer.rules.block.gfm.listItemStart =
            marked.Lexer.rules.block.normal.listItemStart =
            /^( *)(?:[*+-]|[A-Za-z0-9]{1,9}[.)]|\([A-Za-z0-9]+\)) */;

        marked.Lexer.rules.block.list = 
        marked.Lexer.rules.block.gfm.list =
        marked.Lexer.rules.block.normal.list = 
            /^( {0,3}(?:[*+-]|[A-Za-z0-9]{1,9}[.)]|\([A-Za-z0-9]\)))([ \t][^\n]+?)?(?:\n|$)/;
    }
}

export default new OverrideExtension();
