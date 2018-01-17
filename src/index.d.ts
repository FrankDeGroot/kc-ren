export interface Rename {
    oldFile: string;
    newFile: string;
}
export declare function renumberDir(dir: string): Promise<void>;
export declare function renumber(files: string[]): Rename[];
