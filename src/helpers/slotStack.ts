import { Dispatch } from 'redux'
import { addSlotToPromptedStack, removeSlotFromPromptedStack } from '../actions'

export function addSlotTopPromptedStack(dispatch: Dispatch, slotName: string, abilityName: string) {
  // check if slot is on stack already
  // if so..
  dispatch(removeSlotFromPromptedStack({ slotName, abilityName }))

  // always
  dispatch(addSlotToPromptedStack({ slotName, abilityName }))
}
