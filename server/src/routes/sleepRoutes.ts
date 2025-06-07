import { FastifyInstance } from 'fastify'
import { AppContext } from '../types/context'
import { createSleepRecordController } from '../controllers/sleepRecordController'

// JSON Schema 정의
const createSleepRecordSchema = {
  type: 'object',
  required: ['date', 'hours'],
  properties: {
    date: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      description: 'YYYY-MM-DD 형식의 날짜'
    },
    hours: {
      type: 'number',
      minimum: 0,
      maximum: 24,
      description: '수면 시간 (0-24시간)'
    },
    note: {
      type: 'string',
      maxLength: 500,
      description: '특이사항 메모 (선택사항)'
    }
  }
}

const updateSleepRecordSchema = {
  type: 'object',
  properties: {
    date: {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      description: 'YYYY-MM-DD 형식의 날짜'
    },
    hours: {
      type: 'number',
      minimum: 0,
      maximum: 24,
      description: '수면 시간 (0-24시간)'
    },
    note: {
      type: 'string',
      maxLength: 500,
      description: '특이사항 메모 (선택사항)'
    }
  }
}

const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      pattern: '^\\d+$',
      description: '수면 기록 ID'
    }
  }
}

// 수면 기록 관련 라우트 등록
export const createSleepRoutes = (context: AppContext) => async (fastify: FastifyInstance) => {
  const sleepRecordController = createSleepRecordController({
    sleepRecordService: context.sleepRecordService
  })

  // 모든 수면 기록 조회
  fastify.get(
    '/',
    {
      schema: {
        description: '모든 수면 기록 조회',
        tags: ['Sleep Records'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    date: { type: 'string' },
                    hours: { type: 'number' },
                    note: { type: 'string' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    sleepRecordController.getAllSleepRecords
  )

  // ID로 수면 기록 조회
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'ID로 수면 기록 조회',
        tags: ['Sleep Records'],
        params: idParamSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  date: { type: 'string' },
                  hours: { type: 'number' },
                  note: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    sleepRecordController.getSleepRecordById
  )

  // 수면 기록 생성
  fastify.post(
    '/',
    {
      schema: {
        description: '새로운 수면 기록 생성',
        tags: ['Sleep Records'],
        body: createSleepRecordSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  date: { type: 'string' },
                  hours: { type: 'number' },
                  note: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    sleepRecordController.createSleepRecord
  )

  // 수면 기록 수정
  fastify.put(
    '/:id',
    {
      schema: {
        description: '수면 기록 수정',
        tags: ['Sleep Records'],
        params: idParamSchema,
        body: updateSleepRecordSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  date: { type: 'string' },
                  hours: { type: 'number' },
                  note: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }
                }
              }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    sleepRecordController.updateSleepRecord
  )

  // 수면 기록 삭제
  fastify.delete(
    '/:id',
    {
      schema: {
        description: '수면 기록 삭제',
        tags: ['Sleep Records'],
        params: idParamSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: { type: 'null' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    sleepRecordController.deleteSleepRecord
  )

  // 수면 통계 조회
  fastify.get(
    '/sleep-statistics',
    {
      schema: {
        description: '수면 통계 조회 - 전체 평균, 요일별 평균, 주간별 추이',
        tags: ['Sleep Statistics'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  overallAverage: {
                    type: 'number',
                    description: '전체 평균 수면시간'
                  },
                  weeklyAverages: {
                    type: 'object',
                    properties: {
                      일: { type: 'number' },
                      월: { type: 'number' },
                      화: { type: 'number' },
                      수: { type: 'number' },
                      목: { type: 'number' },
                      금: { type: 'number' },
                      토: { type: 'number' }
                    },
                    description: '요일별 평균 수면시간'
                  },
                  weeklyTrends: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        week: { type: 'string' },
                        average: { type: 'number' }
                      }
                    },
                    description: '주간별 평균 수면시간 추이'
                  }
                }
              }
            }
          }
        }
      }
    },
    sleepRecordController.getSleepStatistics
  )
}
