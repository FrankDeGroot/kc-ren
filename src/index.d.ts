export interface Rename {
    oldName: string;
    newName: string;
}
export declare function renumberDir(path: string): Promise<void>;
export declare function renumber(files: string[]): Rename[];
