import { marked } from 'marked';

type Marked = typeof marked;

export enum OutputType {
    HMTL,
    LATEX
}
