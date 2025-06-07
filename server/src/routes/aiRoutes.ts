import { FastifyInstance } from 'fastify'
import { AIAdvisorController } from '../controllers/aiAdvisorController'

const aiAdviceResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'object',
      properties: {
        advice: { type: 'string' },
        sleepQuality: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
        recommendations: {
          type: 'array',
          items: { type: 'string' }
        },
        insights: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['advice', 'sleepQuality', 'recommendations', 'insights']
    },
    message: { type: 'string' }
  },
  required: ['success', 'data', 'message']
}

export const aiRoutes = async (fastify: FastifyInstance, controller: AIAdvisorController) => {
  // AI 수면 조언 가져오기
  fastify.get(
    '/ai-advice',
    {
      schema: {
        description: 'AI 기반 수면 조언을 받습니다',
        tags: ['AI'],
        response: {
          200: aiAdviceResponseSchema,
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    controller.getSleepAdvice
  )
}
