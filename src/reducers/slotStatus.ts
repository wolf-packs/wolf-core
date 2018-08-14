import { Reducer } from 'redux'
import { SlotStatus } from '../types'
import { REQ_CONFIRM_SLOT, ENABLE_SLOT, DISABLE_SLOT, FILL_SLOT, ACCEPT_SLOT, DENY_SLOT,
  RESET_SLOT_STATUS_BY_ABILITY_NAME, 
  SET_SLOT_DONE} from '../actions'
import { SlotId } from '../types'
import { changeArrayItemOnIndex, findIndexOfSlotIdsBySlotId } from '../helpers'

const makeDefaultSlotStatus = (slotId: SlotId): SlotStatus => ({
  ...slotId,
  isEnabled: true,
  isDone: false
})

const setIsDoneBySlotId = (prev: SlotStatus[], slotId: SlotId, isDoneValue: boolean): SlotStatus[] => {
  const slotIndex = findIndexOfSlotIdsBySlotId(prev, slotId)
  const slotFound = slotIndex > -1
  const slot = slotFound ? {
    ...prev[slotIndex],
    isDone: isDoneValue
  } : {
    ...makeDefaultSlotStatus(slotId),
    isDone: isDoneValue
  }
  const result = slotFound ? changeArrayItemOnIndex(prev, slotIndex, slot) : prev.concat([slot])
  return result
}

const reducer: Reducer = (prev: SlotStatus[] = [], action): SlotStatus[] => {
  if (action.type === REQ_CONFIRM_SLOT) {
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
        confirmationSlot: confirmationSlotId.slotName,
        isDone: false
      }
      result.push(originSlot)
    } else {
      prevOriginSlot = prev[originSlotIndex]
      const originSlot: SlotStatus = {
        ...prevOriginSlot,
        confirmationSlot: confirmationSlotId.slotName,
        isDone: false
      }
      result[originSlotIndex] = originSlot
    }

    if (confirmationSlotIndex === -1) {
      prevConfirmationSlot = makeDefaultSlotStatus(confirmationSlotId)
      const confirmationSlot: SlotStatus = {
        ...prevConfirmationSlot,
        requestingSlot: originSlotId.slotName,
        isDone: false
      }
      result.push(confirmationSlot)
    } else {
      prevConfirmationSlot = prev[confirmationSlotIndex]
      const confirmationSlot: SlotStatus = {
        ...prevConfirmationSlot,
        requestingSlot: originSlotId.slotName,
        isDone: false
      }
      result[confirmationSlotIndex] = confirmationSlot
    }

    return result
  }

  if (action.type === FILL_SLOT) {
    // set isDone to true
    const {slotName, abilityName}: SlotId = action.payload
    const slotId = {slotName, abilityName}
    return setIsDoneBySlotId(prev, slotId, true)
  }

  if (action.type === ACCEPT_SLOT) {
    // set slotId (origin) isDone to true
    const slotId = action.payload
    return setIsDoneBySlotId(prev, slotId, true)
  }

  if (action.type === DENY_SLOT) {
    // set slotId (origin) isDone to false
    const slotId = action.payload
    return setIsDoneBySlotId(prev, slotId, false)
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

  if (action.type === RESET_SLOT_STATUS_BY_ABILITY_NAME) {
    const allSlots = prev
    const abilityName = action.payload
    const abilitySlots = allSlots.filter((_) => _.abilityName === abilityName)
    const updatedSlots = abilitySlots.map((_) => {
      return { ..._, isDone: false }
    })
    // slots that will remain the same
    const untouchedSlots = allSlots.filter((_) => _.abilityName !== abilityName)

    return [
      ...untouchedSlots,
      ...updatedSlots
    ]
  }

  if (action.type === SET_SLOT_DONE) {
    return setIsDoneBySlotId(prev, action.payload.slotId, action.payload.isDone);
  }

  return prev
}

export default reducer
