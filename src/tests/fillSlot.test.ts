/* global describe it test expect */
import fillSlot, { validateSlots, ValidateSlotsResult, FillSlotsResult } from '../stages/fillSlot'
import { WolfState, Ability, MessageType } from '../types';
import { NlpResult } from '../stages/intake';

// const initialWolfState = {
//   abilityCompleted: false,
//   activeAbility: '',
//   waitingFor: {
//     slotName: null,
//     turnCount: 0
//   },
//   messageQueue: [],
//   pendingData: {}
// }

test('FillSlot Stage with Initial Wolf State (starting ability)', () => {
  const abilities: Ability[] = [{
      name: 'orderPizza',
      slots: [{
        entity: 'size',
        query: 'What size would you like?',
        type: 'string',
        acknowledge: (value) => `ok! your pizza size is set to ${value}`
      }, {
        entity: 'kind',
        query: 'What kind of result would you like?',
        type: 'string'
      }]
  }]

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

  const intakeResult = {
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
  }
  
  const validateResult: ValidateSlotsResult = validateSlots(abilities, intakeResult)

  const result: FillSlotsResult = fillSlot(abilities, validateResult)
  expect(result).toEqual({
    abilityCompleted: false,
    activeAbility: 'orderPizza', // default abilityName
    waitingFor: {
      slotName: null,
      turnCount: 0
    },
    messageQueue: [{
      message:  'ok! your pizza size is set to L',
      slotName: 'size',
      type: MessageType.slotFillMessage,
    }],
    pendingData: {
      orderPizza: {
        size: 'L',
      }
    }
  })
})

test('FillSlot Stage with Active Ability and partially filled slots', () => {
  const abilities: Ability[] = [{
    name: 'orderPizza',
    slots: [{
      entity: 'size',
      query: 'What size would you like?',
      type: 'string',
      acknowledge: (value) => `ok! your pizza size is set to ${value}`
    }, {
      entity: 'kind',
      query: 'What kind of result would you like?',
      type: 'string',
      acknowledge: (value) => `ok! type of pizza: ${value}`
    }]
  }]

  const nlpResult: NlpResult = {
    intent: 'orderPizza',
    entities: [
      {
        entity: 'kind',
        value: 'Sausage',
        string: 'sausage'
      }
    ]
  }

  const intakeResult = {
    nlpResult: nlpResult,
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: 'orderPizza', // default abilityName
      waitingFor: {
        slotName: 'kind',
        turnCount: 0
      },
      messageQueue: [],
      pendingData: {}
    }
  }

  const validateResult: ValidateSlotsResult = validateSlots(abilities, intakeResult)
  const result: FillSlotsResult = fillSlot(abilities, validateResult)
  expect(result).toEqual({
    abilityCompleted: false,
    activeAbility: 'orderPizza', // default abilityName
    waitingFor: {
      slotName: null,
      turnCount: 0
    },
    messageQueue: [{
      message: 'ok! type of pizza: Sausage',
      slotName: 'kind',
      type: MessageType.slotFillMessage,
    }],
    pendingData: {
      orderPizza: {
        kind: 'Sausage'
      }
    }
  })
})
