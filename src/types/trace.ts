import { SlotRecord } from './slot';
import { Promiseable } from './generic';

export interface Trace<G> {
    slotName: string,
    getValue?: <S>(records: SlotRecord[], convoStorageLayer: G) => Promiseable<S | null>
}