import * as fs from 'fs';
import * as path from 'path';

interface Rename {
	oldFile: string,
	newFile: string
}

const dir = '../JAVA8/slides';
const files = fs.readdirSync(dir);
const renames = renumber(files);
for(var rename of renames) {
	fs.renameSync(path.join(dir, rename.oldFile), path.join(dir, rename.newFile));
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