import { combineReducers } from 'redux'
import messageData from './messageData'
import abilityStatus from './abilityStatus'
import slotStatus from './slotStatus'
import slotData from './slotData'
import promptedSlotStack from './promptedSlotStack'
import outputMessageQueue from './outputMessageQueue'

export default combineReducers({
  messageData,
  slotStatus,
  slotData,
  abilityStatus,
  promptedSlotStack,
  focusedAbility,
  outputMessageQueue,
  filledSlotsOnCurrentTurn
})
