// Wolf runner
export { makeWolfStoreCreator, run, getDefaultWolfState } from './wolf'

// Types
export { OuttakeResult } from './stages/outtake'
export {
  Ability,
  Slot,
  NlpResult,
  NlpEntity,
  SetSlotDataFunctions,
  GetSlotDataFunctions,
  GetStateFunctions,
  SlotConfirmationFunctions,
  OutputMessageType,
  OutputMessageItem,
  IncomingSlotData,
  WolfStateStorage,
  StorageLayer,
  WolfState
} from './types'

// Stages
import intake from './stages/intake'
import fillSlot from './stages/fillSlot'
import evaluate from './stages/evaluate'
import execute from './stages/execute'
import outtake from './stages/outtake'

export const stages = {
  intake,
  fillSlot,
  evaluate,
  execute,
  outtake
}
