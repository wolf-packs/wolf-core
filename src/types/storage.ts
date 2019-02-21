import { WolfState } from './state'

/**
 * Factory type for the StorageLayer object 
 */
export interface StorageLayerFactory<K, T> {
  (key: K, initial?: T): StorageLayer<T>
}

/**
 * Storage type to persist the wolf state. Since Wolf is stateless, the wolf state needs 
 * to be persisted by the developer and so it can be utilized on the next turn. Wolf will handle
 * reading and saving the wolf state within the runner but the developer is required to provide
 * the persistence implementation.
 * 
 * _Developer should utilize this type when implementing the persistence layer._
 */
export type WolfStateStorage = StorageLayer<WolfState>

/**
 * Storage type to assist developers in persisting their data. These read and save
 * functions will be made available to the developer within the user defined ability functions.
 * 
 * _This type should be implemented by the developer and passed into Wolf._
 */
export type StorageLayer<T> =
  AllAsyncStorageLayer<T> |
  OnlyReadAsyncStorageLayer<T> |
  OnlySaveAsyncStorageLayer<T> |
  AllSyncStorageLayer<T>

export type AllAsyncStorageLayer<T> = {
  read: () => Promise<T>,
  save: (value: T) => Promise<void>,
}

export type OnlyReadAsyncStorageLayer<T> = {
  read: () => Promise<T>,
  save: (value: T) => void,
}

export type OnlySaveAsyncStorageLayer<T> = {
  read: () => T,
  save: (value: T) => Promise<void>,
}

export type AllSyncStorageLayer<T> = {
  read: () => T,
  save: (value: T) => void
}
