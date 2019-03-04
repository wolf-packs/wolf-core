import * as slotHelpers from '../../../../src/helpers/slot'
import { Slot, AllSyncStorageLayer } from '../../../types';

interface MockUserState {
  firstName: string,
  lastName: string,
  age: number
}

describe('getSlotByName function', () => {
  test('when slot array is empty', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = []
    const slotName = 'slot1'

    function runGetSlotByName() {
      slotHelpers.getSlotByName(slots, slotName)
    }
    expect(runGetSlotByName).toThrowError(
      `No slot exists given the slot name: ${slotName}`
    )
  })

  test('when slot does not exist', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'slot1',
      query: () => 'what is slot1?'
    }]
    const slotName = 'slot2'

    function runGetSlotByName() {
      slotHelpers.getSlotByName(slots, slotName)
    }
    expect(runGetSlotByName).toThrowError(
      `No slot exists given the slot name: ${slotName}`
    )
  })

  test('when slot exists', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'slot1',
      query: () => 'what is slot1?'
    }, {
      name: 'slot2',
      query: () => 'what is slot2?'
    }]
    const slotName = 'slot2'

    const actual = slotHelpers.getSlotByName(slots, slotName)
    expect(actual).toEqual(slots[1])
  })
})
