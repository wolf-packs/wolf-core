interface EvaluateResult {

}

/**
 * Evaluate Stage (S3):
 * 
 * TODO
 * 
 * @param
 * 
 * @returns
 */
export default function evaluate(): EvaluateResult {
  return 0
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