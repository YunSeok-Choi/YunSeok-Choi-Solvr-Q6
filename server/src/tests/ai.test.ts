import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { sleepRecords, users } from '../db/schema'
import { createSleepRecordService } from '../services/sleepRecordService'
import { createUserService } from '../services/userService'
import { createAIAdvisorService } from '../services/aiAdvisorService'
import { createAIAdvisorController } from '../controllers/aiAdvisorController'
import { aiRoutes } from '../routes/aiRoutes'
import { AppContext } from '../types/context'
import * as schema from '../db/schema'

describe('AI Advisor API', () => {
  let app: FastifyInstance
  let db: BetterSQLite3Database<typeof schema>
  let sqlite: Database.Database
  let context: AppContext

  beforeAll(async () => {
    // 인메모리 테스트 데이터베이스 생성
    sqlite = new Database(':memory:')
    db = drizzle(sqlite, { schema })

    // 테스트 테이블 생성
    sqlite.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    sqlite.exec(`
      CREATE TABLE sleep_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        hours INTEGER NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // Fastify 인스턴스 생성
    app = Fastify({ logger: false })

    // 컨텍스트 생성
    context = {
      userService: createUserService({ db }),
      sleepRecordService: createSleepRecordService({ db }),
      aiAdvisorService: createAIAdvisorService({ apiKey: '' }) // 테스트용 빈 API 키
    }

    // AI 컨트롤러 생성 및 라우트 등록
    const aiController = createAIAdvisorController({
      aiAdvisorService: context.aiAdvisorService,
      sleepRecordService: context.sleepRecordService
    })

    await app.register(fastify => aiRoutes(fastify, aiController), { prefix: '/api/ai' })
  })

  afterAll(async () => {
    await app.close()
    sqlite.close()
  })

  beforeEach(async () => {
    // 각 테스트 전에 테이블 초기화
    await db.delete(sleepRecords)
    await db.delete(users)
  })

  describe('GET /api/ai/ai-advice', () => {
    it('수면 기록이 없을 때 기본 조언을 반환해야 함', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/ai/ai-advice'
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('advice')
      expect(data.data).toHaveProperty('sleepQuality')
      expect(data.data).toHaveProperty('recommendations')
      expect(data.data).toHaveProperty('insights')
      expect(Array.isArray(data.data.recommendations)).toBe(true)
      expect(Array.isArray(data.data.insights)).toBe(true)
      expect(data.data.advice).toContain('수면 기록이 부족하여')
    })

    it('수면 기록이 있을 때 분석된 조언을 반환해야 함', async () => {
      // 먼저 사용자 생성
      const userData = await db
        .insert(users)
        .values({
          name: 'AI 테스트 사용자',
          email: 'ai-test@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning()

      const userId = userData[0].id

      // 수면 기록 추가
      await db.insert(sleepRecords).values([
        {
          date: '2025-06-07',
          hours: 8,
          note: '잘 잤음',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          date: '2025-06-06',
          hours: 6,
          note: '조금 부족함',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])

      // AI 조언 요청
      const response = await app.inject({
        method: 'GET',
        url: '/api/ai/ai-advice'
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.success).toBe(true)
      expect(data.data.advice).toBeTruthy()
      expect(['excellent', 'good', 'fair', 'poor']).toContain(data.data.sleepQuality)
      expect(data.data.recommendations.length).toBeGreaterThan(0)
      expect(data.data.insights.length).toBeGreaterThan(0)

      // 폴백 분석이므로 평균 수면시간 관련 내용이 포함되어야 함
      expect(data.data.advice).toContain('평균')
    })

    it('API 키가 없어도 폴백 분석을 제공해야 함', async () => {
      // 수면 기록 추가
      const userData = await db
        .insert(users)
        .values({
          name: '폴백 테스트 사용자',
          email: 'fallback-test@example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning()

      const userId = userData[0].id

      await db.insert(sleepRecords).values({
        date: '2025-06-07',
        hours: 8,
        note: '좋은 수면',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/ai/ai-advice'
      })

      expect(response.statusCode).toBe(200)

      const data = JSON.parse(response.body)
      expect(data.success).toBe(true)
      expect(typeof data.data.advice).toBe('string')
      expect(data.data.advice.length).toBeGreaterThan(0)
      expect(data.data.recommendations).toContain('규칙적인 수면 시간 유지하기')
    })
  })
})
