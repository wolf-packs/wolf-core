import * as arrayHelpers from '../../../../src/helpers/array'
import { SlotId } from '../../../types';

describe('changeArrayItemOnIndex function', () => {
    test('when SlotID does not exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        expect(() => arrayHelpers.changeArrayItemOnIndex(slotIds, 3, { slotName: slotIds[3].slotName, abilityName: 'ability1' })).toThrowError()
    })

    test('when SlotID does exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability3'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        const actual = arrayHelpers.changeArrayItemOnIndex(slotIds, 0, { slotName: slotIds[0].slotName, abilityName: 'ability2' })
        expect(actual).toEqual(
            [{ slotName: 'slot1', abilityName: 'ability2' },
            { slotName: 'slot3', abilityName: 'ability1' }]
        )

    })
})

describe('removeSlotFromSlotIdArray function', () => {
    test('when SlotID does not exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        const singleSlotId: SlotId = {
            slotName: 'slot4',
            abilityName: 'ability2'
        }

        const actual = arrayHelpers.removeSlotFromSlotIdArray(slotIds, singleSlotId)
        expect(actual).toEqual(slotIds)
    })

    test('when SlotID does exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability3'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = arrayHelpers.removeSlotFromSlotIdArray(slotIds, singleSlotId)
        expect(actual).toEqual(
            [{ slotName: 'slot3', abilityName: 'ability1' }]
        )

    })
})