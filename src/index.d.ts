export interface Rename {
    oldName: string;
    newName: string;
}
export declare function renumberDir(dir: string): Promise<void>;
export declare function renumber(files: string[]): Rename[];
