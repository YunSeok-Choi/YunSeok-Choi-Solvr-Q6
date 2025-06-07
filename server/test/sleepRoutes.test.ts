import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { sleepRecords } from '../src/db/schema'
import { createSleepRecordService } from '../src/services/sleepRecordService'
import { createSleepRoutes } from '../src/routes/sleepRoutes'
import { AppContext } from '../src/types/context'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema'

describe('Sleep Records API', () => {
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

    // 컨텍스트 생성 (userService는 테스트에서 사용하지 않으므로 null로 설정)
    context = {
      userService: null as any,
      sleepRecordService: createSleepRecordService({ db })
    }

    // 라우트 등록
    await app.register(createSleepRoutes(context), { prefix: '/api/sleep-records' })
  })

  afterAll(async () => {
    await app.close()
    sqlite.close()
  })

  beforeEach(async () => {
    // 각 테스트 전에 테이블 초기화
    await db.delete(sleepRecords)
  })

  describe('GET /api/sleep-records', () => {
    it('빈 배열을 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toEqual([])
    })

    it('모든 수면 기록을 반환해야 합니다', async () => {
      // 테스트 데이터 삽입
      const testData = [
        {
          date: '2024-01-01',
          hours: 8,
          note: '좋은 수면',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          date: '2024-01-02',
          hours: 7,
          note: '보통 수면',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        }
      ]

      await db.insert(sleepRecords).values(testData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.data[0].date).toBe('2024-01-02') // 최신 날짜부터 정렬
      expect(body.data[1].date).toBe('2024-01-01')
    })
  })

  describe('GET /api/sleep-records/:id', () => {
    it('존재하는 수면 기록을 반환해야 합니다', async () => {
      // 테스트 데이터 삽입
      const testData = {
        date: '2024-01-01',
        hours: 8,
        note: '좋은 수면',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const inserted = await db.insert(sleepRecords).values(testData).returning()
      const recordId = inserted[0].id

      const response = await app.inject({
        method: 'GET',
        url: `/api/sleep-records/${recordId}`
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(recordId)
      expect(body.data.date).toBe('2024-01-01')
      expect(body.data.hours).toBe(8)
      expect(body.data.note).toBe('좋은 수면')
    })

    it('존재하지 않는 ID에 대해 404를 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/999'
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toBe('수면 기록을 찾을 수 없습니다.')
    })

    it('잘못된 ID 형식에 대해 400을 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/invalid'
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      // Fastify Schema validation error format
      expect(body.statusCode).toBe(400)
      expect(body.error).toBe('Bad Request')
    })
  })

  describe('POST /api/sleep-records', () => {
    it('새로운 수면 기록을 생성해야 합니다', async () => {
      const newRecord = {
        date: '2024-01-01',
        hours: 8,
        note: '좋은 수면'
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/sleep-records',
        payload: newRecord
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.message).toBe('수면 기록이 성공적으로 생성되었습니다.')
      expect(body.data.date).toBe('2024-01-01')
      expect(body.data.hours).toBe(8)
      expect(body.data.note).toBe('좋은 수면')
      expect(body.data.id).toBeDefined()
      expect(body.data.createdAt).toBeDefined()
      expect(body.data.updatedAt).toBeDefined()
    })

    it('note 없이도 수면 기록을 생성해야 합니다', async () => {
      const newRecord = {
        date: '2024-01-01',
        hours: 7
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/sleep-records',
        payload: newRecord
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      // DrizzleORM에서 optional text 필드는 빈 문자열 또는 null일 수 있음
      expect([null, '', undefined]).toContain(body.data.note)
    })

    it('필수 필드가 없으면 400을 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/sleep-records',
        payload: { date: '2024-01-01' } // hours 누락
      })

      expect(response.statusCode).toBe(400)
    })

    it('잘못된 날짜 형식에 대해 400을 반환해야 합니다', async () => {
      const newRecord = {
        date: '2024/01/01', // 잘못된 형식
        hours: 8
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/sleep-records',
        payload: newRecord
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      // JSON Schema 검증 에러 - Fastify 표준 형식
      expect(body.error).toBe('Bad Request')
    })

    it('잘못된 수면 시간에 대해 400을 반환해야 합니다', async () => {
      const newRecord = {
        date: '2024-01-01',
        hours: 25 // 24시간 초과
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/sleep-records',
        payload: newRecord
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      // JSON Schema 검증 에러 - Fastify 표준 형식
      expect(body.error).toBe('Bad Request')
    })
  })

  describe('PUT /api/sleep-records/:id', () => {
    it('기존 수면 기록을 수정해야 합니다', async () => {
      // 테스트 데이터 삽입
      const testData = {
        date: '2024-01-01',
        hours: 8,
        note: '좋은 수면',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const inserted = await db.insert(sleepRecords).values(testData).returning()
      const recordId = inserted[0].id

      const updateData = {
        date: '2024-01-02',
        hours: 7,
        note: '수정된 수면'
      }

      const response = await app.inject({
        method: 'PUT',
        url: `/api/sleep-records/${recordId}`,
        payload: updateData
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.message).toBe('수면 기록이 성공적으로 수정되었습니다.')
      expect(body.data.date).toBe('2024-01-02')
      expect(body.data.hours).toBe(7)
      expect(body.data.note).toBe('수정된 수면')
    })

    it('부분 업데이트가 가능해야 합니다', async () => {
      // 테스트 데이터 삽입
      const testData = {
        date: '2024-01-01',
        hours: 8,
        note: '좋은 수면',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const inserted = await db.insert(sleepRecords).values(testData).returning()
      const recordId = inserted[0].id

      const updateData = {
        hours: 9 // 수면 시간만 수정
      }

      const response = await app.inject({
        method: 'PUT',
        url: `/api/sleep-records/${recordId}`,
        payload: updateData
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.date).toBe('2024-01-01') // 기존 값 유지
      expect(body.data.hours).toBe(9) // 수정된 값
      expect(body.data.note).toBe('좋은 수면') // 기존 값 유지
    })

    it('존재하지 않는 ID에 대해 404를 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/sleep-records/999',
        payload: { hours: 8 }
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toBe('수면 기록을 찾을 수 없습니다.')
    })
  })

  describe('DELETE /api/sleep-records/:id', () => {
    it('기존 수면 기록을 삭제해야 합니다', async () => {
      // 테스트 데이터 삽입
      const testData = {
        date: '2024-01-01',
        hours: 8,
        note: '좋은 수면',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      const inserted = await db.insert(sleepRecords).values(testData).returning()
      const recordId = inserted[0].id

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/sleep-records/${recordId}`
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.message).toBe('수면 기록이 성공적으로 삭제되었습니다.')
      expect(body.data).toBeNull()

      // 삭제 확인
      const checkResponse = await app.inject({
        method: 'GET',
        url: `/api/sleep-records/${recordId}`
      })
      expect(checkResponse.statusCode).toBe(404)
    })

    it('존재하지 않는 ID에 대해 404를 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/sleep-records/999'
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(false)
      expect(body.error).toBe('수면 기록을 찾을 수 없습니다.')
    })

    it('잘못된 ID 형식에 대해 400을 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/sleep-records/invalid'
      })

      expect(response.statusCode).toBe(400)
      const body = JSON.parse(response.body)
      // Fastify Schema validation error format
      expect(body.statusCode).toBe(400)
      expect(body.error).toBe('Bad Request')
    })
  })
})
