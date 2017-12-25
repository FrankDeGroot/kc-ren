import * as fs from 'fs';
import * as path from 'path';

interface Rename {
	oldFile: string,
	newFile: string
}

export function renumberDir(dir: string) {
	const files = fs.readdirSync(dir);
	const renames = renumber(files);
	for(var rename of renames) {
		const oldFile = path.join(dir, rename.oldFile);
		const newFile = path.join(dir, rename.newFile);
		fs.renameSync(oldFile, newFile);
		if (fs.statSync(newFile).isDirectory()) {
			renumberDir(newFile);
		}
	}
}

export function renumber(files: string[]): Rename[] {
	const count = files.length.toString().length
	const renFiles = [];
	var index = 1;
	for (var file of files) {
		const match = /([^-]+)-(.*)/.exec(file);
			if (match) {
				const newFile = '0' + (index++).toString().padStart(count, '0') + '0' + '-' + match[2];
				if (file != newFile) {
					renFiles.push({ oldFile: file, newFile: newFile });
				}
		}
	}
	return renFiles.reverse();
}
