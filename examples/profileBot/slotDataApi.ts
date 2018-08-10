import { MemoryStorage, StoreItems, Storage } from "../../node_modules/botbuilder"
import { Ability } from "../../src"

export interface ApiValidateResult {
    isValid: boolean,
    reason: string | null,
    value: any,
    slotName?: string,
    abilityName?: string
}

interface bodyValue {
    value: any,
    slotName: string,
    abilityName: string
}

/**
 * Slot Data API route
 * 
 * req.body example
 * {
 *  conversationId: 'abc123',
 *  values: [
 *    {
 *      value: '100',
 *      slotName: 'age',
 *      abilityName: 'profile'
 *    }
 *  ]
 * }
 */
export const slotDataEndpoint = (apiStorage: Storage, abilities: Ability[]) => async (req: any, res: any) => {
  const body = {
      conversationId: req.body.conversationId, 
      values: req.body.values
  }

  // get data corresponding to conversationid
  const slotData = await apiStorage.read([body.conversationId])
  
  // test validation
  const validatorResults = body.values.map((payload: bodyValue): ApiValidateResult => {
    // get ability
    const ability = abilities.filter((ability) => payload.abilityName === ability.name)
    if (ability.length === 0) { // empty check
      return { isValid: false, reason: 'Ability does not exist.', value: payload.value }
    } 

    // get slot
    const slot = ability[0].slots.filter((slot) => payload.slotName === slot.name)
    if (slot.length === 0) { //empty check
      return { isValid: false, reason: 'Slot does not exist.', value: payload.value }
    } 
    
    let result ={ isValid: true, reason: null, value: payload.value, slotName: payload.slotName, abilityName: payload.abilityName }
    if(slot[0].validate) {
      const valResult = slot[0].validate(payload.value, { rawText: payload.value, intent: '', entities: [] })
      result = { ...valResult, ...result}
    }

    return { ...result, value: payload.value, slotName: payload.slotName, abilityName: payload.abilityName }
  })
  
  // store results that passed
  const validResults = validatorResults.filter((_: ApiValidateResult) => _.isValid === true)
  
  let delta: ApiValidateResult[] = validResults

  if (slotData && slotData[body.conversationId]) {
    // prexisting data.. append changes
    // concat array with new objects
    delta = slotData[body.conversationId].data.concat(delta)
  }

  // write to storage which will be made available to S1
  const state = { data: delta, eTag: '*' }
  const changes: StoreItems = {}
  changes[body.conversationId] = state
  await apiStorage.write(changes)

  const responseString = validatorResults
  res.send(responseString)
}
  