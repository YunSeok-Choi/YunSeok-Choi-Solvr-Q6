import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createUserRoutes } from './userRoutes'
import { createSleepRoutes } from './sleepRoutes'
import { createAIAdvisorController } from '../controllers/aiAdvisorController'
import { aiRoutes } from './aiRoutes'
import healthRoutes from './healthRoutes'

// 모든 라우트 등록
export const createRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  // 헬스 체크 라우트
  fastify.register(healthRoutes, { prefix: '/api/health' })

  // 사용자 관련 라우트
  fastify.register(createUserRoutes(context), { prefix: '/api/users' })

  // 수면 기록 관련 라우트
  fastify.register(createSleepRoutes(context), { prefix: '/api/sleep-records' })

  // AI 조언 관련 라우트
  const aiController = createAIAdvisorController({
    aiAdvisorService: context.aiAdvisorService,
    sleepRecordService: context.sleepRecordService
  })
  fastify.register(fastify => aiRoutes(fastify, aiController), { prefix: '/api/ai' })
}
