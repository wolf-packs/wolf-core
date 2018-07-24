import { Reducer } from 'redux'
import { SlotStatus } from '../types'
import { CONFIRM_SLOT, ENABLE_SLOT, DISABLE_SLOT } from '../actions'
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

  if (action.type === ENABLE_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload)
    let slot: SlotStatus
    let result = [...prev]
    if (slotIndex === -1) {
      slot = makeDefaultSlotStatus(action.payload)
      result.push(slot)
    } else {
      slot = {
        ...prev[slotIndex],
        isEnabled: true
      }
      result[slotIndex] = slot
    }
    return result
  }

  if (action.type === DISABLE_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload)
    let slot: SlotStatus
    let result = [...prev]
    if (slotIndex === -1) {
      slot = {
        ...makeDefaultSlotStatus(action.payload),
        isEnabled: false
      }
      result.push(slot)
    } else {
      slot = {
        ...prev[slotIndex],
        isEnabled: false
      }
      result[slotIndex] = slot
    }
    return result
  }
  return prev
}

export default reducer