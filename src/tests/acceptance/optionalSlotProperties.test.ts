import * as wolf from '../..'
import { getInitialWolfState, createStorage, TestCase, runTest, StorageLayerType } from '../helpers'

interface UserConvoState {
  animalName: string | null,
  magicWordStrict: string | null,
  magicWordStrict2: string | null
}

const defaultStore: UserConvoState = {
  animalName: null,
  magicWordStrict: null,
  magicWordStrict2: null
}

const slots: wolf.Slot<StorageLayerType<UserConvoState>>[] = [
  {
    name: 'animalName',
    query: () => 'Please name an animal... if you want.',
  },
  {
    name: 'magicWordStrict',
    query: () => 'Please say \'wolf\'... not negotiable.',
    validate: (submittedValue) => {
      if (submittedValue !== 'wolf') {
        return { isValid: false, reason: 'Please follow directions.' }
      }
      return { isValid: true, reason: null }
    },
  },
  {
    name: 'magicWordStrict2',
    query: () => 'Please say \'wolf\' one more time.',
    retry: () => 'You must say \'wolf\' a second time',
    validate: (submittedValue) => {
      if (submittedValue !== 'wolf') {
        return { isValid: false, reason: 'Please follow directions.' }
      }
      return { isValid: true, reason: null }
    },
    onFill: () => {
      return 'Thank you for saying wolf wolf!'
    }
  }
]

const abilities: wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[] = [{
  name: 'magicWord',
  traces:[{
    slotName: 'animalName'
  },
  {
    slotName: 'magicWordStrict'
  },
  {
    slotName: 'magicWordStrict2'
  }] ,
  onComplete: (submittedData, convoStorageLayer) => {
    const newState = {
      animalName: submittedData.animalName,
      magicWordStrict: submittedData.magicWordStrict,
      magicWordStrict2: submittedData.magicWordStrict2
    }
    convoStorageLayer.save(newState)
    return `You said: '${submittedData.animalName}', \
'${submittedData.magicWordStrict}', \
'${submittedData.magicWordStrict2}'!`
  }
}] as wolf.Ability<UserConvoState, StorageLayerType<UserConvoState>>[]

const wolfStorage: wolf.WolfStateStorage = createStorage(getInitialWolfState())
const convoStorage = createStorage(defaultStore)

const optionalSlotPropertyTestCase: TestCase<UserConvoState, StorageLayerType<UserConvoState>> = {
  description: 'Optional Slot Properties',
  abilities: abilities,
  slots: slots,
  defaultAbility: 'magicWord',
  wolfStorage,
  convoStorage,
  conversationTurns: [
    {
      input: { message: 'hello', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please name an animal... if you want.'],
        state: { animalName: null, magicWordStrict: null, magicWordStrict2: null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please say \'wolf\'... not negotiable.'],
        state: { animalName: null, magicWordStrict: null, magicWordStrict2: null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please follow directions.'],
        state: { animalName: null, magicWordStrict: null, magicWordStrict2: null }
      }
    },
    {
      input: { message: 'wolf', entities: [], intent: 'magicWord' },
      expected: {
        message: ['Please say \'wolf\' one more time.'],
        state: { animalName: null, magicWordStrict: null, magicWordStrict2: null }
      }
    },
    {
      input: { message: 'hippo', entities: [], intent: 'magicWord' },
      expected: {
        message: [
          'Please follow directions.',
          'You must say \'wolf\' a second time'
        ],
        state: { animalName: null, magicWordStrict: null, magicWordStrict2: null }
      }
    },
    {
      input: { message: 'wolf', entities: [], intent: 'magicWord' },
      expected: {
        message: [
          'Thank you for saying wolf wolf!',
          'You said: \'hippo\', \'wolf\', \'wolf\'!'
        ],
        state: {
          animalName: 'hippo',
          magicWordStrict: 'wolf',
          magicWordStrict2: 'wolf'
        }
      }
    }
  ]
}

describe('Optional Slot Properties', () => {
  runTest(test, optionalSlotPropertyTestCase)
})
