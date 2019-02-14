export type Promiseable<T> = T | Promise<T>

export interface AnyObject {
  [key: string]: any,
  [key: number]: any
}
