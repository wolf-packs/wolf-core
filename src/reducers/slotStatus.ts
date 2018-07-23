import { Reducer } from 'redux'
import { SlotStatus } from '../types'
import { CONFIRM_SLOT } from '../actions'
import { SlotId } from '../types'
import { changeArrayItemOnIndex, findIndexOfSlotIdsBySlotId } from '../helpers'

const makeDefaultSlotStatus = (slotId: SlotId): SlotStatus => ({
  ...slotId,
  isEnabled: true
})

const reducer: Reducer = (prev: SlotStatus[] = [], action) => {
  if (action.type === CONFIRM_SLOT) {
    const {originSlotId, confirmationSlotId} = action.payload as {originSlotId: SlotId, confirmationSlotId: SlotId}
    const originSlotIndex = findIndexOfSlotIdsBySlotId(prev, originSlotId)
    const confirmationSlotIndex = findIndexOfSlotIdsBySlotId(prev, confirmationSlotId)

    let prevOriginSlot: SlotStatus
    let prevConfirmationSlot: SlotStatus
    let result = [...prev]

    if (originSlotIndex === -1) {
      prevOriginSlot = makeDefaultSlotStatus(originSlotId)
      const originSlot: SlotStatus = {
        ...prevOriginSlot,
        confirmationSlot: confirmationSlotId.slotName
      }
      result.push(originSlot)
    } else {
      prevOriginSlot = prev[originSlotIndex]
      const originSlot: SlotStatus = {
        ...prevOriginSlot,
        confirmationSlot: confirmationSlotId.slotName
      }
      result[originSlotIndex] = originSlot
    }

    if (confirmationSlotIndex === -1) {
      prevConfirmationSlot = makeDefaultSlotStatus(confirmationSlotId)
      const confirmationSlot: SlotStatus = {
        ...prevConfirmationSlot,
        requestingSlot: originSlotId.slotName
      }
      result.push(confirmationSlot)
    } else{
      prevConfirmationSlot = prev[confirmationSlotIndex]
      const confirmationSlot: SlotStatus = {
        ...prevConfirmationSlot,
        requestingSlot: originSlotId.slotName
      }
      result[confirmationSlotIndex] = confirmationSlot
    }

    return result
  }
  return prev
}

export default reducer