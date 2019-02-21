import { Store, Action } from 'redux'
import {
  WolfState, Ability, Slot, OutputMessageType, SlotId,
  SlotData, GetSlotDataFunctions, GetStateFunctions, StorageLayer
} from '../types'
import {
  getAbilitiesCompleteOnCurrentTurn, getPromptedSlotStack,
  getSlotBySlotId, getSlotDataByAbilityName
} from '../selectors'
import {
  addMessage as addMessageAction, setSlotPrompted, setAbilityStatus,
  resetSlotStatusByAbilityName
} from '../actions'
import { findInSlotIdItemBySlotId } from '../helpers'
const logState = require('debug')('wolf:s4:enterState')
const log = require('debug')('wolf:s4')

export interface ExecuteResult {
  runOnComplete: () => Promise<OnCompletePromiseResult<string>[]>,
  addMessage: (msgData: OnCompletePromiseResult<string>) => void
}

interface OnCompletePromiseResult<T> {
  result: T,
  abilityName: string
}

const makeSubmittedDataFromSlotData = (slotData: SlotData[]) => {
  return slotData.reduce((prev, current) => ({
    ...prev,
    [current.slotName]: current.value
  }), {})
}

/**
 * Execute Stage (S4):
 * 
 * Responsible for executing an ability onComplete, slot query or bypass.
 * 
 * @param store redux
 * @param convoStorageLayer conversationState Storage Layer
 * @param abilities user defined abilities and slots
 */
export default function execute<T>(
  store: Store<WolfState>,
  convoStorageLayer: StorageLayer<T>,
  abilities: Ability<T>[]
): ExecuteResult | void {
  const { dispatch, getState } = store
  logState(getState())
  const addMessage = (msg: OnCompletePromiseResult<string>) => dispatch(
    addMessageAction(
      {
        message: msg.result,
        abilityName: msg.abilityName,
        type: OutputMessageType.abilityCompleteMessage
      }
    )
  )

  let onCompleteReturnResult: ExecuteResult | undefined

  // Check if S4 should run an ability onComplete
  const abilityCompleteResult = getAbilitiesCompleteOnCurrentTurn(getState())
  if (abilityCompleteResult.length > 0) {
    const valueOrPromiseArr = runAbilityOnComplete(getState, convoStorageLayer, abilities, abilityCompleteResult)
    const allPromises: Promise<(OnCompletePromiseResult<string | void>)>[] = valueOrPromiseArr.map((_) => {
      const { result: valueOrPromise, abilityName } = _
      if (typeof valueOrPromise === 'string') {
        return Promise.resolve({ result: valueOrPromise, abilityName })
      }

      if (!valueOrPromise) {
        // void
        return Promise.resolve({ result: undefined, abilityName })
      }

      // promise
      return valueOrPromise.then((result) => ({ result, abilityName }))
    })

    abilityCompleteResult.forEach((abilityName: string) => {
      // set ability status to complete
      dispatch(setAbilityStatus(abilityName, true))

      // reset all slot status to pending (isDone = false)
      dispatch(resetSlotStatusByAbilityName(abilityName))
    })

    onCompleteReturnResult = {
      runOnComplete: () => Promise.all(allPromises)
        .then(result => result.filter((_) => _.result)) as Promise<OnCompletePromiseResult<string>[]>,
      addMessage
    }
  }

  // Check if S4 should prompt a slot
  const promptedSlotStack = getPromptedSlotStack(getState())
  if (promptedSlotStack[0]) {
    const slot = promptedSlotStack[0]

    // check if slot is already prompted
    if (slot.prompted) {
      return
    }

    // slot has not been prompted yet.. prompt here
    const slotToPrompt = getSlotBySlotId(abilities, { slotName: slot.slotName, abilityName: slot.abilityName })
    if (slotToPrompt) {
      const runSlotQueryResult = runSlotQuery(convoStorageLayer, store, slotToPrompt, slot.abilityName)
      runSlotQueryResult.forEach(dispatch)

      if (onCompleteReturnResult) {
        return onCompleteReturnResult
      }
      return
    }
    // SLOT NOT VALID.. continue
  }

  if (onCompleteReturnResult) {
    return onCompleteReturnResult
  }

  // NO ABILITY TO COMPLETE..
  // NO SLOT TO PROMPT..
  return
}

/**
 * Execute ability.onComplete()
 */
function runAbilityOnComplete<T>(
  getState: () => WolfState,
  convoStorageLayer: StorageLayer<T>,
  abilities: Ability<T>[],
  abilitiesToComplete: string[]
): {
  result: Promise<string | void> | string | void,
  abilityName: string
}[] {

  return abilitiesToComplete.map((abilityToComplete) => {
    const ability = abilities.find((ability) => ability.name === abilityToComplete)
    log(`according to the wolfstate, ability ${abilityToComplete}'s onComplete needs to run`)
    if (!ability) {
      log(`  however, ${abilityToComplete} is not found in the abilities definition`)
      // ability is not found. the result gets filtered out because result is void
      return {
        result: Promise.resolve(),
        abilityName: abilityToComplete
      }
    }

    const abilitySlotData = getSlotDataByAbilityName(getState(), ability.name)
    const submittedData = makeSubmittedDataFromSlotData(abilitySlotData)
    const wolfState = getState()

    const getStateFuncs: GetStateFunctions<T> = {
      getAbilityList: () => abilities,
      getMessageData: () => wolfState.messageData
    }

    return {
      result: ability.onComplete(convoStorageLayer, submittedData, getStateFuncs),
      abilityName: ability.name
    }
  })
}

/**
 * makeGetSlotFillFunctions
 * 
 * create an object that has the correct getters for slot information
 */
function makeGetSlotDataFunctions({ getState }: Store<WolfState>, abilityName: string): GetSlotDataFunctions {
  const wolfState = getState()
  const { slotStatus, slotData } = wolfState
  return {
    getSlotStatus: <SlotStatus>(slotName: string) => findInSlotIdItemBySlotId(slotStatus, { abilityName, slotName }),
    getSlotValue: <SlotData>(slotName: string) => findInSlotIdItemBySlotId(slotData, { abilityName, slotName })
  }
}

/**
 * Execute slot.query()
 */
function runSlotQuery<T>(
  convoStorageLayer: StorageLayer<T>,
  store: Store<WolfState>,
  slot: Slot<StorageLayer<T>>,
  abilityName: string
): Action[] {
  const getSlotDataFunctions = makeGetSlotDataFunctions(store, abilityName)
  const queryString = slot.query(convoStorageLayer, getSlotDataFunctions)

  // add query to output message queue
  const message = {
    message: queryString,
    type: OutputMessageType.queryMessage,
    slotName: slot.name,
    abilityName
  }
  const slotId: SlotId = {
    slotName: slot.name,
    abilityName
  }
  return [addMessageAction(message), setSlotPrompted(slotId, true)]
}
