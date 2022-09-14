/* eslint-disable @typescript-eslint/naming-convention */
import { marked } from 'marked';
import { AbstractStyle } from './styles/abstract-style';
import { defaultMonoTextStyle, defaultSansSerifTextStyle, defaultSerifTextStyle } from './styles/text/font-styles.js';

/**
 * A single document to be converted. The markdown parser
 * works synchronously, so this document is reset() right before
 * it's updated.
 * @author Bowserinator
 */
export class Document {
    footnotes: Array<string>;
    headers: Array<string>;
    headerNumbers: [number, number, number, number, number, number, number, number];

    styles: { [K: string]: AbstractStyle };
    frontMatter: { [K: string]: any };

    /** Construct a document */
    constructor() {
        this.reset();
    }

    /** Reset all properties to default */
    reset() {
        this.footnotes = [];
        this.headers = [];
        this.headerNumbers = [0, 0, 0, 0, 0, 0, 0, 0];
        this.frontMatter = {};
        this.styles = {
            serifTextStyle: defaultSerifTextStyle,
            sansSerifTextStyle: defaultSansSerifTextStyle,
            monoTextStyle: defaultMonoTextStyle,

            globalTextStyle: defaultSerifTextStyle,
            codeBlockStyle: defaultSerifTextStyle, // TODO
            pageStyle: defaultSerifTextStyle, // TODO
            tableStyle: defaultSerifTextStyle // TODO
        };
    }

    setFrontMatter(frontMatter: { [K: string]: any }) {
        this.frontMatter = frontMatter;
        // TODO: update styles??
    }

    addHeader(level: number) {
        if (level === 1) return ''; // Ignore top-level headers
        level -= 2; // Zero index

        // Reset all header levels after
        for (let i = level + 1; i < this.headerNumbers.length; i++)
            this.headerNumbers[i] = 0;
        // Increment current header level
        this.headerNumbers[level]++;
        // Return all values up to this level concated
        return this.headerNumbers.slice(0, level + 1).join('.');
    }

    addHeaderName(string, level) {
        const headerId = (new marked.Slugger()).slug(string);
        if (level === 1) return; // Ignore top-level headers
        if (level === 2) // 2nd top-level headers are bolded
            string = `<b>${string}</b>`;
        // Indent by level
        this.headers.push('&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(level - 1) +
            `<a href="#header-${headerId}">${string}</a>`);
    }
}

export const doc = new Document();
