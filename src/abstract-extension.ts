import { Marked } from './types.js';

/**
 * An abstract extension for a MarkTex feature
 * Extend this class and override the methods
 * @author Bowserinator
 */
export class AbstractExtension {
    id: string;
    name: string;
    author: string;
    description: string;
    priority: number;
    disabled: boolean;

    /**
     * Construct the extension
     * @param id Short identifier for in-code identification
     * @param name Long name
     * @param author Author
     * @param description Sort description of features
     * @param priority Priority, lower = loads first, defaults to 100
     *  Important base builtin extensions have negative numbers, you shouldn't do that unless you
     *  know what you are doing!
     */
    constructor(id: string, name: string, author: string, description: string, priority = 100) {
        if (this.constructor === AbstractExtension)
            throw new Error('AbstractExtension is abstract and cannot be instantiated');
        this.id = id;
        this.name = name;
        this.author = author;
        this.description = description;
        this.priority = priority;
        this.disabled = false;
    }

    /**
     * Code to inject into <head>
     * @return HTML code to inject into <head> of the output
     */
    htmlHeaderInject(): string {
        return '';
    }

    /**
     * Modify the marked instance (change defaults, etc...)
     * Note: for extensions it's better to use exportExtensions
     * @param marked Marked instance, modify it freely
     */
    marked(marked: Marked) {

    }

    /**
     * Pre-process markdown code
     * @param md Raw markdown document
     * @return Modified markdown code, or null to skip the preparse
     *         step entirely (won't even call the method)
     */
    preParse(md: string): string | null {
        return null;
    }

    /**
     * List of extensions for marked.use
     * @return List of extensions to put into marked.use
     */
    exportExtensions(): Array<any> {
        return [];
    }

    /**
     * Additional parsing with the marked instance
     * can be freely done after everything is parsed
     */
    postTree(marked: Marked) {

    }

    /**
     * Run after HTML has been generated,
     * but before pagination
     * @param html HTML output
     * @return New html output
     */
    postHTML(html: string): string {
        return html;
    }
}
