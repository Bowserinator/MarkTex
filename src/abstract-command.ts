

export abstract class AbstractCommand {
    id: string;
    name: string;
    author: string;
    description: string;
    disabled: boolean;

    /**
     * Construct the command
     * @param id Short identifier for in md usage (ie the @command_name part)
     * @param name Long name
     * @param author Author
     * @param description Sort description of features
     */
    constructor(id: string, name: string, author: string, description: string) {
        this.id = id;
        this.name = name;
        this.author = author;
        this.description = description;
        this.disabled = false;
    }

    html(args: { [K: string]: any }, body: string) {
        return `${this.startTag(args)}${this.body(args, body)}${this.endTag(args)}`;
    }

    startTag(args: { [K: string]: any }) {
        return '<div>';
    }

    body(args: { [K: string]: any }, body: string) {
        return body;
    }

    endTag(args: { [K: string]: any }) {
        return '</div>';
    }
}
