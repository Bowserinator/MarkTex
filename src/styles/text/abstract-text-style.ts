import { AbstractStyle } from '../abstract-style.js';
import { Document } from '../../document.js';

export interface TextStyleOptions {
    font?: string;
    fontSizes?: Array<number>;
    letterSpacing?: string;
    wordSpacing?: string;
    lineHeight?: string;
    fontColor?: string;
    indent?: string;
}

/**
 * Stores style data for default paragraph text
 * @author Bowserinator
 */
export abstract class AbstractTextStyle extends AbstractStyle {
    font?: string;
    fontSizes?: Array<number>;
    letterSpacing?: string;
    wordSpacing?: string;
    lineHeight?: string;
    fontColor?: string;
    indent?: string;

    constructor(options: TextStyleOptions) {
        super();
        this.font = options.font;
        this.fontSizes = options.fontSizes;
        this.letterSpacing = options.letterSpacing || '0px';
        this.wordSpacing = options.wordSpacing || '0px';
        this.lineHeight = options.lineHeight || 'normal';
        this.fontColor = options.fontColor || 'black';
        this.indent = options.indent || '0px';
    }

    createStyleTag(doc: Document, prefix?: string): string {
        return ``;
    }
}
