import api from './axios'

// Matches app/ai/router.py exactly:
//   POST /ai/predict   -> { prediction, confidence }               (response_model=PredictionResponse)
//   GET  /ai/history   -> List[AIPrediction] -> { id, prediction, confidence, created_at }
// Note: the predictor also computes a raw "probability", but PredictionResponse
// only declares prediction+confidence, so FastAPI strips probability from the
// /predict response. It isn't stored in the ai_predictions table either, so
// /history never has it. Not invented here — this mirrors the schema exactly.
export const analysisService = {
  predict: async (payload) => {
    const { data } = await api.post('/ai/predict', payload)
    return data
  },
  history: async () => {
    const { data } = await api.get('/ai/history')
    return data
  },
}

export default analysisService
