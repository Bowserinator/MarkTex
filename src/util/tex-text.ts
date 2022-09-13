
// @see https://www.sascha-frank.com/latex-font-size.html
export const FONT_SIZES = `command,9,10,11,12,14,17,20,25,30,36,48,60
miniscule,4,5,6,7,8,9,10,11,12,14,17,20
tiny,5,6,7,8,9,10,11,12,14,17,20,25
scriptsize,6,7,8,9,10,11,12,14,17,20,25,30
footnotesize,7,8,9,10,11,12,14,17,20,25,30,36
small,8,9,10,11,12,14,17,20,25,30,36,48
normalsize,9,10,11,12,14,17,20,25,30,36,48,60
large,10,11,12,14,17,20,25,30,36,48,60,72
Large,11,12,14,17,20,25,30,36,48,60,72,84
LARGE,12,14,17,20,25,30,36,48,60,72,84,96
huge,14,17,20,25,30,36,48,60,72,84,96,108
Huge,17,20,25,30,36,48,60,72,84,96,108,120
HUGE,20,25,30,36,48,60,72,84,96,108,120,132`
    .split('\n').map(line => line.split(','));
export const FONT_SIZE_NAMES = FONT_SIZES.map(line => line[0]);

export function getFontSizeForSize(size: string) {
    if (!FONT_SIZE_NAMES.includes(size))
        throw new Error(`Unknown font size ${size}`);
}
