import * as mathHelpers from '../../../../src/helpers/math'
import { SlotId } from '../../../types';

describe('randomElement function', () => {
  test('when array is empty', () => {
    const arr: SlotId[] = []

    const actual = mathHelpers.randomElement(arr)
    expect(actual).toBeUndefined()
  })

  test('when array is not empty', () => {
    const arr: SlotId[] = [{
        slotName: 'slot1',
        abilityName: 'abiility4'
    },{
        slotName: 'slot3',
        abilityName: 'ability2'
    }, {
        slotName: 'slot2',
        abilityName: 'ability1'
    }, {
        slotName: 'slot1',
        abilityName: 'ability3'
    }]

    const actual = mathHelpers.randomElement(arr)
    expect(actual).toHaveProperty('slotName')
  })
})
