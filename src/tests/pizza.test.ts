/* global test */
import intake, { NlpResult, IntakeResult } from '../stages/old_intake'
import { WolfState, Ability, MessageType, ConvoState, ActionType } from '../types';
import { randomElement, addMessageToQueue } from '../helpers'
import evaluate, { EvaluateResult } from '../stages/old_evaluate';
import fillSlots, { ValidateSlotsResult, validateSlots, FillSlotsResult } from '../stages/old_fillSlot';
import action, { ActionResult } from '../stages/old_action';
import outtake, { OuttakeResult } from '../stages/old_outtake';

const initialWolfState = {
  abilityCompleted: false,
  activeAbility: '',
  waitingFor: {
    slotName: null,
    turnCount: 0
  },
  messageQueue: [],
  pendingData: {}
}

type PizzaData = {
  pizzaType: string,
  pizzaSize: string,
  quantity: string  
}

describe('Add a Pizza a cart', () => { // Feature (ability)
  
})
