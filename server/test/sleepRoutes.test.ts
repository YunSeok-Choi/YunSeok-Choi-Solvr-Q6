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

  describe('GET /api/sleep-records/sleep-statistics', () => {
    it('데이터가 없을 때 기본값을 반환해야 합니다', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/sleep-statistics'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.overallAverage).toBe(0)
      expect(body.data.weeklyAverages).toEqual({})
      expect(body.data.weeklyTrends).toEqual([])
    })

    it('단일 수면 기록에 대한 통계를 계산해야 합니다', async () => {
      const testData = {
        date: '2024-01-01', // 2024년 1월 1일은 월요일
        hours: 8,
        note: '좋은 수면',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }

      await db.insert(sleepRecords).values(testData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/sleep-statistics'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)
      expect(body.data.overallAverage).toBe(8)
      expect(body.data.weeklyAverages['월']).toBe(8)
      expect(body.data.weeklyTrends).toHaveLength(1)
      expect(body.data.weeklyTrends[0]).toEqual({ week: 'Week 1', average: 8 })
    })

    it('복수 수면 기록에 대한 통계를 정확히 계산해야 합니다', async () => {
      const testData = [
        // 2024년 1월 첫째 주 (월~일)
        {
          date: '2024-01-01',
          hours: 8,
          note: '월요일',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }, // 월
        {
          date: '2024-01-02',
          hours: 7,
          note: '화요일',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        }, // 화
        {
          date: '2024-01-03',
          hours: 6,
          note: '수요일',
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z'
        }, // 수
        {
          date: '2024-01-04',
          hours: 9,
          note: '목요일',
          createdAt: '2024-01-04T00:00:00.000Z',
          updatedAt: '2024-01-04T00:00:00.000Z'
        }, // 목
        {
          date: '2024-01-05',
          hours: 7.5,
          note: '금요일',
          createdAt: '2024-01-05T00:00:00.000Z',
          updatedAt: '2024-01-05T00:00:00.000Z'
        }, // 금
        {
          date: '2024-01-06',
          hours: 8.5,
          note: '토요일',
          createdAt: '2024-01-06T00:00:00.000Z',
          updatedAt: '2024-01-06T00:00:00.000Z'
        }, // 토
        {
          date: '2024-01-07',
          hours: 9,
          note: '일요일',
          createdAt: '2024-01-07T00:00:00.000Z',
          updatedAt: '2024-01-07T00:00:00.000Z'
        }, // 일

        // 2024년 1월 둘째 주 시작
        {
          date: '2024-01-08',
          hours: 6.5,
          note: '둘째주 월',
          createdAt: '2024-01-08T00:00:00.000Z',
          updatedAt: '2024-01-08T00:00:00.000Z'
        }, // 월
        {
          date: '2024-01-09',
          hours: 7.5,
          note: '둘째주 화',
          createdAt: '2024-01-09T00:00:00.000Z',
          updatedAt: '2024-01-09T00:00:00.000Z'
        } // 화
      ]

      await db.insert(sleepRecords).values(testData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/sleep-statistics'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)

      // 전체 평균: (8+7+6+9+7.5+8.5+9+6.5+7.5) / 9 = 69.5 / 9 = 7.72 (반올림) = 7.7
      expect(body.data.overallAverage).toBe(7.7)

      // 요일별 평균 확인
      expect(body.data.weeklyAverages['월']).toBe(7.3) // (8 + 6.5) / 2 = 7.25 -> 7.3
      expect(body.data.weeklyAverages['화']).toBe(7.3) // (7 + 7.5) / 2 = 7.25 -> 7.3
      expect(body.data.weeklyAverages['수']).toBe(6) // 6 / 1 = 6
      expect(body.data.weeklyAverages['목']).toBe(9) // 9 / 1 = 9
      expect(body.data.weeklyAverages['금']).toBe(7.5) // 7.5 / 1 = 7.5
      expect(body.data.weeklyAverages['토']).toBe(8.5) // 8.5 / 1 = 8.5
      expect(body.data.weeklyAverages['일']).toBe(9) // 9 / 1 = 9

      // 주간별 추이 확인 (7일 단위)
      expect(body.data.weeklyTrends).toHaveLength(2)
      expect(body.data.weeklyTrends[0]).toEqual({ week: 'Week 1', average: 7.9 }) // (8+7+6+9+7.5+8.5+9) / 7 = 7.86 -> 7.9
      expect(body.data.weeklyTrends[1]).toEqual({ week: 'Week 2', average: 7 }) // (6.5+7.5) / 2 = 7
    })

    it('요일별 평균에서 데이터가 없는 요일은 0으로 처리해야 합니다', async () => {
      const testData = [
        {
          date: '2024-01-01',
          hours: 8,
          note: '월요일만',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      await db.insert(sleepRecords).values(testData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/sleep-statistics'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)

      expect(body.data.weeklyAverages['월']).toBe(8)
      expect(body.data.weeklyAverages['화']).toBe(0)
      expect(body.data.weeklyAverages['수']).toBe(0)
      expect(body.data.weeklyAverages['목']).toBe(0)
      expect(body.data.weeklyAverages['금']).toBe(0)
      expect(body.data.weeklyAverages['토']).toBe(0)
      expect(body.data.weeklyAverages['일']).toBe(0)
    })

    it('소수점 수면 시간을 정확히 처리해야 합니다', async () => {
      const testData = [
        {
          date: '2024-01-01',
          hours: 7.5,
          note: '7시간 30분',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          date: '2024-01-02',
          hours: 8.5,
          note: '8시간 30분',
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        }
      ]

      await db.insert(sleepRecords).values(testData)

      const response = await app.inject({
        method: 'GET',
        url: '/api/sleep-records/sleep-statistics'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.success).toBe(true)

      // 전체 평균: (7.5 + 8.5) / 2 = 8.0
      expect(body.data.overallAverage).toBe(8)
    })
  })
})
