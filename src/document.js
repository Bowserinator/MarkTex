/**
 * A single document to be converted. The markdown parser
 * works synchronously, so this document is reset() right before
 * it's updated.
 * @author Bowserinator
 */
class Document {
    /** Construct a document */
    constructor() {
        this.reset();
    }

    /** Reset all properties to default */
    reset() {
        this.footnotes = [];
        this.headers = [];
        this.headerNumbers = [0, 0, 0, 0, 0, 0, 0, 0];
    }

    addHeader(level) {
        if (level === 1) return ''; // Ignore headers
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
        if (level === 1) return;
        if (level === 2)
            string = `<b>${string}</b>`;
        this.headers.push('&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(level - 1) + string);
    }
}

const doc = new Document();

export default doc;
