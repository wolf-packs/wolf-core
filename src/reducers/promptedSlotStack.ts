import { Reducer } from 'redux'
import { PromptSlot, SlotId, PromptSlotReason, OutputMessageType } from '../types'
import { ADD_SLOT_TO_PROMPTED_STACK,
  REMOVE_SLOT_FROM_PROMPTED_STACK, SET_SLOT_PROMPTED, REQ_CONFIRM_SLOT, ADD_MESSAGE, INCREMENT_TURN_COUNT_BY_ID } from '../actions'
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

const addSlotToPromptedStack = (prev: SlotId[], slotId: SlotId, reason: PromptSlotReason): PromptSlot[] => {
  const slotIndex = findIndexOfSlotIdsBySlotId(prev, slotId)
  const isSlotMissing: boolean = slotIndex === -1
  const slot = isSlotMissing ? makeDefaultPromptSlot(slotId, reason) : prev[slotIndex]
  const updatedPromptedSlotStack = changeArrayItemOnIndex(prev, slotIndex, slot)
  const result = isSlotMissing ? [slot, ...prev] : moveIndexItemToTop(updatedPromptedSlotStack, slotIndex)
  return result
}

const reducer: Reducer = (prev: PromptSlot[] = [], action) => {
  if ( action.type === REQ_CONFIRM_SLOT ) {
    const slotId = action.payload.confirmationSlotId
    return addSlotToPromptedStack(prev, slotId, PromptSlotReason.confirmation)
  }

  if ( action.type === ADD_SLOT_TO_PROMPTED_STACK ) {
    const {slotId, reason} = action.payload
    const result = addSlotToPromptedStack(prev, slotId, reason)
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

    const result = prev.filter((slot) => !(slot.slotName === slotName && slot.abilityName === abilityName))
    return result
  }

  if (action.type === INCREMENT_TURN_COUNT_BY_ID) {
    const { slotName, abilityName } = action.payload
    const stack = prev 
    const targetIndex = stack.findIndex((_) => _.slotName === slotName && _.abilityName === abilityName)
    const foundIndex = targetIndex > -1
    if (!foundIndex) {
      return prev
    }
    const newStackItem = {
      ...stack[targetIndex],
      turnCount: stack[targetIndex].turnCount + 1
    }
    return changeArrayItemOnIndex(prev, targetIndex, newStackItem)
  }      

  return prev
}

export default reducer