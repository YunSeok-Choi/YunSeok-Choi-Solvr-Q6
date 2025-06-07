import { FastifyRequest, FastifyReply } from 'fastify'
import { AIAdvisorService } from '../services/aiAdvisorService'
import { SleepRecordService } from '../services/sleepRecordService'

type AIAdvisorControllerDeps = {
  aiAdvisorService: AIAdvisorService
  sleepRecordService: SleepRecordService
}

export const createAIAdvisorController = ({
  aiAdvisorService,
  sleepRecordService
}: AIAdvisorControllerDeps) => {
  const getSleepAdvice = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 모든 수면 기록을 가져와서 분석
      const sleepRecords = await sleepRecordService.getAllSleepRecords()

      // AI 분석 수행
      const analysis = await aiAdvisorService.analyzeSleepPattern(sleepRecords)

      reply.send({
        success: true,
        data: analysis,
        message: 'AI 수면 분석이 완료되었습니다'
      })
    } catch (error) {
      console.error('AI 조언 생성 중 오류:', error)

      reply.status(500).send({
        success: false,
        error: 'AI 조언 생성 중 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  return {
    getSleepAdvice
  }
}

export type AIAdvisorController = ReturnType<typeof createAIAdvisorController>
