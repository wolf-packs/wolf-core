import { PromptSlot, SlotId } from '../types'

export const FILL_SLOT = 'FILL_SLOT'
export const fillSlot = (slotName: string, abilityName: string, value: any) => ({
  type: FILL_SLOT,
  payload: { slotName, abilityName, value }
})

export const ADD_SLOT_TO_PROMPTED_STACK = 'ADD_SLOT_TO_PROMPTED_STACK'
export const addSlotToPromptedStack = (promptedSlot: SlotId) => ({
  type: ADD_SLOT_TO_PROMPTED_STACK,
  payload: promptedSlot
})

export const REMOVE_SLOT_FROM_PROMPTED_STACK = 'REMOVE_SLOT_FROM_PROMPTED_STACK'
export const removeSlotFromPromptedStack = (removeSlot: SlotId) => ({
  type: REMOVE_SLOT_FROM_PROMPTED_STACK,
  payload: removeSlot
})

export const ENABLE_SLOT = 'ENABLE_SLOT'
export const enableSlot = (slotId: SlotId) => ({
  type: ENABLE_SLOT,
  payload: slotId
})

export const DISABLE_SLOT = 'DISABLE_SLOT'
export const disableSlot = (slotId: SlotId) => ({
  type: DISABLE_SLOT,
  payload: slotId
})

export const CONFIRM_SLOT = 'CONFIRM_SLOT'
export const confirmSlot = (originSlotId: SlotId, confirmationSlotId: SlotId) => ({
  type: CONFIRM_SLOT,
  payload: {
    originSlotId,
    confirmationSlotId
  }
})

export const ACCEPT_SLOT = 'ACCEPT_SLOT'
export const acceptSlot = (slotId: SlotId) => ({
  type: ACCEPT_SLOT,
  payload: slotId
})

export const DENY_SLOT = 'DENY_SLOT'
export const denySlot = (slotId: SlotId) => ({
  type: DENY_SLOT,
  payload: slotId
})

export const START_FILL_SLOT_STAGE = 'START_FILL_SLOT_STAGE'
export const startFillSlotStage = () => ({
  type: START_FILL_SLOT_STAGE
})
