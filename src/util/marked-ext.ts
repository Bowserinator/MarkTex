import { marked } from 'marked';

interface MdSettings {
    name: string;       // Name of token type
    level: string;      // 'block' or 'inline'
    start: RegExp;      // Regex start hint
    tokenMatch: RegExp; // Regex to perform match

    // Function to add additional properties to token
    tokenRules?: (token: any, src: string, tokens: Array<any>, match: Array<string>) => void;

    // Function to do something with the tokens afterwards, usually for inline parsing
    inline?: (lexer: typeof marked.Lexer, token: any) => void;

    // Convert token to string, should take into account the document output type
    renderer: (token: any) => string;
}

/**
 * Helper to simplify marked extensions
 * @param keys Settings
 * @return Extension object for marked.use({ extensions: [...] })
 */
export function mdExt(keys: MdSettings): any {
    return {
        name: keys.name,
        level: keys.level,
        start(src: string) {
            return src.match(keys.start)?.index;
        },
        tokenizer(src: string, tokens: Array<any>) {
            const rule = keys.tokenMatch;
            const match = rule.exec(src);
            if (match) {
                const token = {
                    type: keys.name,
                    raw: match[0],
                    tokens: []
                };
                if (keys.tokenRules)
                    keys.tokenRules(token, src, tokens, match);
                if (keys.inline)
                    keys.inline(this.lexer, token);
                return token;
            }
        },
        renderer: keys.renderer
    };
}
