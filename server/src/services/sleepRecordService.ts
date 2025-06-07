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

  return {
    getAllSleepRecords,
    getSleepRecordById,
    createSleepRecord,
    updateSleepRecord,
    deleteSleepRecord
  }
}

export type SleepRecordService = ReturnType<typeof createSleepRecordService>
