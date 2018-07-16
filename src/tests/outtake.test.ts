/* global describe it test expect */
import { ActionResult } from '../stages/action'
import outtake, { OuttakeResult } from '../stages/outtake'

interface Pizza {
  kind: string,
  size: string
}

test('Outtake Stage with Initial Wolf State (starting ability)', () => {
  const actionResult: ActionResult = {
    abilityCompleted: false,
    activeAbility: 'orderPizza',
    messageQueue: [
      {
        message: 'ok! your pizza size is set to L',
        slotName: 'size',
        type: 3,
      },
      {
        message: 'What kind of result would you like?',
        slotName: 'kind',
        type: 2,
      },
    ],
    pendingData: {
      orderPizza: {
        size: 'L',
      },
    },
    waitingFor: {
      slotName: 'kind',
      turnCount: 0,
    }
  }
 // there are two seats (y)
    acknowledge: (value: Pizza) => {
      return 'your pizza is added to the cart'
    }

  const convoState = {cart: []}
  
  const result: OuttakeResult = outtake(convoState, actionResult)
  expect(result).toEqual(['ok! your pizza size is set to L', 'What kind of result would you like?'])
})
