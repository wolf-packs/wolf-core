/* global test */
import intake, { NlpResult, IntakeResult } from '../stages/intake'
import { WolfState } from '../types';

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

test('Intake Stage with default Ability', () => {
  const wolfState: WolfState = initialWolfState

  const nlpResult: NlpResult = {
    intent: '',
    entities: []
  } 

  const userMessage = 'hi'
  const defaultAbility = 'help'

  let intakeResult: IntakeResult = intake(wolfState, nlpResult, userMessage, defaultAbility)
  
  expect(intakeResult).toEqual({
    nlpResult: nlpResult,
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: defaultAbility, // default abilityName
      waitingFor: {
        slotName: null,
        turnCount: 0
      },
      messageQueue: [],
      pendingData: {}
    }
  })
})

test('Intake Stage with detected NLP result', () => {
  const wolfState: WolfState = initialWolfState
  const nlpResult: NlpResult = {
    intent: 'orderPizza',
    entities: [
      {
        entity: 'size',
        value: 'L',
        string: 'large'
      }
    ]
  }
  const userMessage = 'I want to order a large pizza'
  const defaultAbility = 'help'

  let intakeResult: IntakeResult = intake(wolfState, nlpResult, userMessage, defaultAbility)

  expect(intakeResult).toEqual({
    nlpResult: nlpResult,
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: 'orderPizza', // default abilityName
      waitingFor: {
        slotName: null,
        turnCount: 0
      },
      messageQueue: [],
      pendingData: {}
    }
  })
})