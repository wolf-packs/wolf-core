import { Store } from 'redux'

/**
 * Evaluate Stage (S3):
 * 
 * TODO
 * 
 * @param
 * 
 * @returns
 */
export default function evaluate({dispatch}: Store): void {
  // Condition: (S2 has not filled a slot) and (S2 has prompted a slot)
  if (!getSlotFillFlag() && getPromptedSlot()) {
    // Retry has already been made this turn by S2, bypass S3
    return
  }

  // Condition: (S2 has filled a slot)
  // Slot has been filled.. IDLE state.. find next slot to prompt
  // or..
  // Condition: (S2 has not filled a slot) and (S2 has not prompted a slot)
  // No slot fill and no retry made.. IDLE state.. find next slot to prompt

  // TODO: find next slot to fill

  return
}

/**
 * Beginning of S3 possible states:
 * (getSlotFillFlag = true)
 * > slot has been filled (getSlotFillFlag) -> idle state -> select new slot to prompt (update prompted slot + active ability)
 * 
 * (getSlotFillFlag = false) (promptSlot = null)
 * > no slot filled -> no retry (no promptSlot)-> idle state -> select new slot to prompt (update prompted slot + active ability)
 * 
 * (getSlotFillFlag = false) (promptSlot = <string>)
 * > no slot filled -> retry has been made (promptSlot) -> do nothing
 */
