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
 * > slot has been filled (getSlotFillFlag) -> idle state -> select new slot to prompt (update prompted slot + active ability)
 * > no slot filled -> no retry -> idle state -> select new slot to prompt (update prompted slot + active ability)
 * > no slot filled -> retry has been made -> do nothing
 */