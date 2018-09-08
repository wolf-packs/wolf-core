import wolfMiddleware, { getMessages, getStore, createWolfStore } from './middlewares/wolfMiddleware'
import {
  Ability,
  Slot,
  NlpResult,
  SetSlotDataFunctions,
  GetSlotDataFunctions,
  GetStateFunctions,
  SlotConfirmationFunctions,
  OutputMessageType,
  OutputMessageItem,
  IncomingSlotData
} from './types'

import intake from './stages/intake'
import fillSlot from './stages/fillSlot'
import evaluate from './stages/evaluate'
import execute from './stages/execute'
import outtake, { OuttakeResult } from './stages/outtake'

const stages = {
  intake,
  fillSlot,
  evaluate,
  execute,
  outtake
}

export {
  wolfMiddleware,
  getMessages,
  getStore,
  createWolfStore,
  stages,
  Ability,
  Slot,
  NlpResult,
  SetSlotDataFunctions,
  GetSlotDataFunctions,
  GetStateFunctions,
  SlotConfirmationFunctions,
  OutputMessageType,
  OutputMessageItem,
  IncomingSlotData,
  OuttakeResult
}
