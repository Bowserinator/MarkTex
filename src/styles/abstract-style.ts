import { Document } from '../document.js';

export abstract class AbstractStyle {
    constructor() {

    }

    abstract createStyleTag(doc: Document, prefix?: string): string;
}
