export interface Rename {
    oldFile: string;
    newFile: string;
}
export declare function renumberDir(dir: string): void;
export declare function renumber(files: string[]): Rename[];
