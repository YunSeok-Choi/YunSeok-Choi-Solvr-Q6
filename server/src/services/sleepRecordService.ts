import { eq, desc } from 'drizzle-orm'
import { sleepRecords } from '../db/schema'
import { CreateSleepRecordDto, UpdateSleepRecordDto, SleepRecord } from '../types'
import { Database } from '../types/database'

type SleepRecordServiceDeps = {
  db: Database
}

export const createSleepRecordService = ({ db }: SleepRecordServiceDeps) => {
  const getAllSleepRecords = async (): Promise<SleepRecord[]> => {
    return db.select().from(sleepRecords).orderBy(desc(sleepRecords.date))
  }

  const getSleepRecordById = async (id: number): Promise<SleepRecord | undefined> => {
    const result = await db.select().from(sleepRecords).where(eq(sleepRecords.id, id)).limit(1)
    return result[0]
  }

  const createSleepRecord = async (data: CreateSleepRecordDto): Promise<SleepRecord> => {
    const now = new Date().toISOString()
    const newRecord = {
      ...data,
      createdAt: now,
      updatedAt: now
    }

    const result = await db.insert(sleepRecords).values(newRecord).returning()
    return result[0]
  }

  const updateSleepRecord = async (
    id: number,
    data: UpdateSleepRecordDto
  ): Promise<SleepRecord | undefined> => {
    const now = new Date().toISOString()
    const updateData = {
      ...data,
      updatedAt: now
    }

    const result = await db
      .update(sleepRecords)
      .set(updateData)
      .where(eq(sleepRecords.id, id))
      .returning()

    return result[0]
  }

  const deleteSleepRecord = async (id: number): Promise<boolean> => {
    const result = await db
      .delete(sleepRecords)
      .where(eq(sleepRecords.id, id))
      .returning({ id: sleepRecords.id })
    return result.length > 0
  }

  const getSleepStatistics = async () => {
    // 모든 수면 기록 가져오기
    const records = await db.select().from(sleepRecords).orderBy(desc(sleepRecords.date))

    if (records.length === 0) {
      return {
        overallAverage: 0,
        weeklyAverages: {},
        weeklyTrends: []
      }
    }

    // 1. 전체 평균 수면시간 계산
    const totalHours = records.reduce((sum, record) => sum + record.hours, 0)
    const overallAverage = Math.round((totalHours / records.length) * 10) / 10

    // 2. 요일별 평균 계산 (0=일요일, 1=월요일, ..., 6=토요일)
    const weeklyData: { [key: number]: { total: number; count: number } } = {}

    records.forEach(record => {
      const date = new Date(record.date)
      const dayOfWeek = date.getDay()

      if (!weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek] = { total: 0, count: 0 }
      }

      weeklyData[dayOfWeek].total += record.hours
      weeklyData[dayOfWeek].count += 1
    })

    // 요일별 평균을 월~일 순서로 정렬
    const weeklyAverages: { [key: string]: number } = {}
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']

    for (let i = 0; i < 7; i++) {
      const dayName = dayNames[i]
      if (weeklyData[i]) {
        weeklyAverages[dayName] = Math.round((weeklyData[i].total / weeklyData[i].count) * 10) / 10
      } else {
        weeklyAverages[dayName] = 0
      }
    }

    // 3. 7일 단위 평균 변화량 계산
    const weeklyTrends: { week: string; average: number }[] = []

    // 날짜 기준으로 정렬 (오래된 것부터)
    const sortedRecords = records.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // 7일 단위로 그룹화
    for (let i = 0; i < sortedRecords.length; i += 7) {
      const weekRecords = sortedRecords.slice(i, i + 7)
      const weekTotal = weekRecords.reduce((sum, record) => sum + record.hours, 0)
      const weekAverage = Math.round((weekTotal / weekRecords.length) * 10) / 10

      const weekNumber = Math.floor(i / 7) + 1
      weeklyTrends.push({
        week: `Week ${weekNumber}`,
        average: weekAverage
      })
    }

    return {
      overallAverage,
      weeklyAverages,
      weeklyTrends
    }
  }

  return {
    getAllSleepRecords,
    getSleepRecordById,
    createSleepRecord,
    updateSleepRecord,
    deleteSleepRecord,
    getSleepStatistics
  }
}

export type SleepRecordService = ReturnType<typeof createSleepRecordService>
