export interface IntakeResult {
  
}

interface NlpResult {
  intent: string | null,
  entities: NlpEntity[]
}

interface NlpEntity {
  value: string,  // normalized value
  text: string,   // raw value
  name: string    // entity name
}
export interface Entity extends NlpEntity {

}

/**
 * Intake Stage (S1):
 * 
 * Takes in user generated NlpResult object and creates messageData object, stored to state.
 * 
 * @param nlpResult user generated NLP Object
 * 
 * @returns void
 */
export default function intake(nlpResult: NlpResult): IntakeResult {
  return 0
}