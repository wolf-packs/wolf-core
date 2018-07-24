import { Reducer } from 'redux'
import { PromptSlot, SlotId, PromptSlotReason } from '../types'
import { ADD_SLOT_TO_PROMPTED_STACK, REMOVE_SLOT_FROM_PROMPTED_STACK, SET_SLOT_PROMPTED } from '../actions'
import { findIndexOfSlotIdsBySlotId, changeArrayItemOnIndex } from '../helpers'

const makeDefaultPromptSlot = (slotId: SlotId, reasonAdded: PromptSlotReason): PromptSlot => ({
  slotName: slotId.slotName,
  abilityName: slotId.abilityName,
  turnCount: 0,
  prompted: false,
  reasonAdded
})

const moveIndexItemToTop = (arr: any[], index: number): any[] => {
  const item = arr[index]
  const removedItemArr = [...arr.slice(0, index), ...arr.slice(index + 1)]
  return [item, ...removedItemArr]
}

const reducer: Reducer = (prev: PromptSlot[] = [], action) => {
  if ( action.type === ADD_SLOT_TO_PROMPTED_STACK ) {
    const {slotId, reason} = action.payload
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, slotId)
    const isSlotMissing: boolean = slotIndex === -1
    const slot = isSlotMissing ? makeDefaultPromptSlot(slotId, reason) : prev[slotIndex]
    const updatedPromptedSlotStack = changeArrayItemOnIndex(prev, slotIndex, slot)
    const result = isSlotMissing ? [slot, ...prev] : moveIndexItemToTop(updatedPromptedSlotStack, slotIndex)
    return result
  }

  if (action.type === SET_SLOT_PROMPTED) {
    const {slotId, prompted} = action.payload
    const slotIndex = findIndexOfSlotIdsBySlotId(prev, slotId)
    const isSlotMissing: boolean = slotIndex === -1
    const slot = isSlotMissing ? makeDefaultPromptSlot(slotId, PromptSlotReason.query) : prev[slotIndex]
    const newSlot: PromptSlot = {
      ...slot,
      prompted
    }
    const result = isSlotMissing ? [...prev, newSlot] : changeArrayItemOnIndex(prev, slotIndex, newSlot)
    return result
  }

  if (action.type === REMOVE_SLOT_FROM_PROMPTED_STACK) {
    const {slotName, abilityName} = action.payload
    return prev.filter((slot) => slot.slotName !== slotName && slot.abilityName !== abilityName )
  }

  return prev
}

export default reducer