import * as findHelpers from '../../../../src/helpers/find'
import { SlotId } from '../../../types';

describe('findIndexofSlotIdsBySlotId function', () => {
    test('when SlotID does not exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability4'
        }

        const actual = findHelpers.findIndexOfSlotIdsBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual(-1)
    })

    test('when SlotID does exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]

        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = findHelpers.findIndexOfSlotIdsBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual(3)

    })
})

describe('findInSlotIdItemBySlotId function', () => {
    test('when SlotID does not exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability4'
        }

        const actual = findHelpers.findInSlotIdItemBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual(undefined)
    })

    test('when SlotID does exist', () => {
        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]

        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = findHelpers.findInSlotIdItemBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual({ slotName: 'slot1', abilityName: 'ability3' })

    })
})
