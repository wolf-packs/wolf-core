export const changeArrayItemOnIndex = (arr: any[], index: number, item: any) => {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)]
}