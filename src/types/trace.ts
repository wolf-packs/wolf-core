import { SlotRecord } from './slot';
import { Promiseable } from './generic';

export interface Trace<G, S = string> {
    slotName: string,
    getValue?: (records: SlotRecord<S>[], convoStorageLayer: G) => Promiseable<G | null>
}