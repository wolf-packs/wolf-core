import { WolfState } from './state'
import { Promiseable } from './generic'

/**
 * Storage interface to persist the wolf state. Since Wolf is stateless, the wolf state needs 
 * to be persisted by the developer and so it can be utilized on the next turn. Wolf will handle
 * reading and saving the wolf state within the runner but the developer is required to provide
 * the persistence implementation.
 * 
 * _Developer should utilize this interface when implementing the persistence layer._
 */
export interface WolfStateStorage extends StorageLayer<WolfState> {
  read: () => Promiseable<WolfState>,
  save: (wolfState: WolfState) => Promiseable<void>,
}

/**
 * Storage interface to assist developers in persisting their data. These read and save
 * functions will be made available to the developer within the user defined ability functions.
 * 
 * _This interface should be implemented by the developer and passed into Wolf._
 */
export interface StorageLayer<T> {
  read: () => Promiseable<T>,
  save: (value: T) => Promiseable<void>
}
