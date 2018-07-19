interface FillSlotResult {

}

/**
 * FillSlot Stage (S2):
 * 
 * TODO
 * 
 * @param
 * 
 * @returns
 */
export default function fillSlot(): FillSlotResult {
  return 0
}

/**
 * Intake(nlpResult)
 * + Creates messageData from nlpResult
 * + Writes to state [SET_MESSAGE_DATA]
 * 
 * Fillslot() - If any slot will be filled on this turn, it should happen at this stage
 * + Checks current status of wolf (idle or waiting for)... using selectors
 * + selector checks waitingForQueue
 * 
 * + if status: idle..
 * ++ check All pending slots for match
 * 
 * + if status: waiting..
 * ++ check waiting slot for any entity match
 * ++ check ALL pending slots for match
 * 
 * + check All pending slots for match (common in both)
 * 
 * Evaluate() - Decide what should be done moving forward. Run onComplete() or slot.query
 * + check active ability..
 * // Active Ability Not Defined
 * + Uses messageData.intent -> set activeAbility
 * 
 * // Active Ability Defined
 * + if (required, enabled) slots are pending
 * ++ Signify Case 1
 * 
 * + if all slots are completed
 * ++ Signify Case 2
 * 
 * Execute()
 * + Case 1: slot.query
 * + Case 2: ability.onComplete()
 * + >> Set new activeAbility == targetAbility (from user)
 * + >> -> Evaluate Stage
 * 
 * Outtake()
 * 
 */