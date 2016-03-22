// Helper to add elements of toAdd onto the given list without constructing additional
// intermediate lists (requiring more memory)
export function addTo(list, toAdd) {
  for (let i = 0; i < toAdd.length; i++) {
    list.push(toAdd[i]);
  }
}