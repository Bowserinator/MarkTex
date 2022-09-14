import { AbstractTextStyle, TextStyleOptions } from './abstract-text-style.js';

/**
 * Stores style data for default paragraph text
 * @author Bowserinator
 */
export class FontTextStyle extends AbstractTextStyle {
    constructor(options: TextStyleOptions) {
        super(options);
    }
}

export const defaultSerifTextStyle = new FontTextStyle({
    font: '"CMU Serif"',
    fontSizes: [],
    letterSpacing: '-0.013rem'
});

export const defaultSansSerifTextStyle = new FontTextStyle({
    font: '"CMU Serif"',
    fontSizes: [],
    letterSpacing: '-0.013rem'
});

export const defaultMonoTextStyle = new FontTextStyle({
    font: '"CMU Serif"',
    fontSizes: [],
    letterSpacing: '-0.013rem'
});
