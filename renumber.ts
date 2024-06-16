export interface Rename {
  oldName: string
  newName: string
}

export function renumber(names: string[]): Rename[] {
  const count = names.length.toString().length
  let index = 1
  return names.map(entry => {
    const match = /\d+(-.*)/.exec(entry)
    const newEntry = match ? (index++).toString().padStart(count, '0') + '0' + match[1] : entry
    return { oldName: entry, newName: newEntry }
  }).reverse()
}