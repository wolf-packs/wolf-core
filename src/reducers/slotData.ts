import { Reducer } from 'redux'
import { SlotData } from '../types'
import { REQ_CONFIRM_SLOT, ACCEPT_SLOT, DENY_SLOT, FILL_SLOT } from '../actions'
import { changeArrayItemOnIndex, findIndexOfSlotIdsBySlotId } from '../helpers'

const makeDefaultSlotData = (slotName: string, abilityName: string, value?: any) => ({
  slotName,
  abilityName,
  value
})

const reducer: Reducer = (prev: SlotData[] = [], action) => {
  if (action.type === FILL_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload)

    if (slotIndex > -1) { // slot Found
      const slot = {
        ...prev[slotIndex],
        value: action.payload.value
      }
      return changeArrayItemOnIndex(prev, slotIndex, slot)
    }
    
    const defaultSlot: SlotData = {
      slotName: action.payload.slotName,
      abilityName: action.payload.abilityName,
      value: action.payload.value
    }
    return prev.concat([defaultSlot])
  }

  if (action.type === REQ_CONFIRM_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload.originSlotId)
    const {slotName, abilityName} = action.payload.originSlotId
    // assuming slotIndex is always found on slotData, since fillSlot has ran already
    const slotFound = slotIndex > -1
    if (!slotFound) {
      const slot: SlotData = {
        ...makeDefaultSlotData(slotName, abilityName),
        isConfirmed: false
      }
      return prev.concat([slot])
    }
    const slot: SlotData = {
      ...(prev[slotIndex]),
      isConfirmed: false
    }
    return changeArrayItemOnIndex(prev, slotIndex, slot)
  }

  if (action.type === ACCEPT_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload)
    // assuming slotIndex is always found on slotData, since fillSlot has ran already
    const slot: SlotData = {
      ...prev[slotIndex],
      isConfirmed: true
    }
    return changeArrayItemOnIndex(prev, slotIndex, slot)
  }

  if (action.type === DENY_SLOT) {
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, action.payload)
    // assuming slotIndex is always found on slotData, since fillSlot has ran already
    const slot: SlotData = {
      ...prev[slotIndex],
      isConfirmed: false,
      value: null
    }
    return changeArrayItemOnIndex(prev, slotIndex, slot)
  }

  return prev
}

export default reducer