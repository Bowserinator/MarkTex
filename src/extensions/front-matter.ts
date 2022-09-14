import { AbstractExtension } from '../abstract-extension.js';
import YAML from 'yaml';
import { doc } from '../document.js';

/**
 * Front matter, set file metadata
 * @author Bowserinator
 */
class FrontMatterExtension extends AbstractExtension {
    constructor() {
        super('frontmatter', 'Front Matter', 'Builtin', `
Markdown front matter. Format (must be at start of document, only
newlines are allowed before the first ---):

---
key: blah
key2:
    - this is yaml
    - by the way
---
`);
    }

    preParse(md: string) {
        const re = /^(?:[\s])*---[\s\S]+---/;
        const match = re.exec(md);

        if (match) {
            md = md.replace(match[0], ''); // Remove the match

            let yaml = match[0].trim();
            yaml = yaml.substring(3, yaml.length - 3);
            doc.setFrontMatter(YAML.parse(yaml));
        }
        return md;
    }
}

export default new FrontMatterExtension();
