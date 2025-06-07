import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'
import env from '../config/env'
import { users, sleepRecords } from './schema'
import { UserRole } from '../types'

// 데이터베이스 디렉토리 생성 함수
async function ensureDatabaseDirectory() {
  const dir = dirname(env.DATABASE_URL)
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

// 초기 사용자 데이터
const initialUsers = [
  {
    name: '관리자',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: '일반 사용자',
    email: 'user@example.com',
    role: UserRole.USER,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    name: '게스트',
    email: 'guest@example.com',
    role: UserRole.GUEST,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// 더미 수면 기록 데이터 생성 함수 (통계 테스트용)
// 실제 프로덕션 환경에서는 실행되지 않습니다
async function insertDummySleepRecords(db: any) {
  try {
    // 기존 수면 기록 데이터 확인
    const existingSleepRecords = await db.select().from(sleepRecords)
    console.log(`기존 수면 기록 수: ${existingSleepRecords.length}`)

    if (existingSleepRecords.length > 0) {
      console.log('수면 기록 데이터가 이미 존재합니다. 더미 데이터 삽입을 건너뜁니다.')
      return
    }

    console.log('더미 수면 기록 데이터 생성 중... (30일치)')

    // 더미 데이터 생성을 위한 설정
    const dummyNotes = ['좋음', '보통', '나쁨']
    const sleepRecordsData = []

    // 오늘 기준 30일 전부터 어제까지의 데이터 생성
    for (let i = 30; i >= 1; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      // YYYY-MM-DD 형식으로 날짜 포맷
      const formattedDate = date.toISOString().split('T')[0]

      // 4~9시간 사이의 랜덤 수면 시간 (0.5 단위)
      const randomHours = Math.round((Math.random() * (9 - 4) + 4) * 2) / 2

      // 랜덤 메모
      const randomNote = dummyNotes[Math.floor(Math.random() * dummyNotes.length)]

      // 현재 시간을 createdAt, updatedAt으로 사용
      const currentTime = new Date().toISOString()

      sleepRecordsData.push({
        date: formattedDate,
        hours: randomHours,
        note: randomNote,
        createdAt: currentTime,
        updatedAt: currentTime
      })
    }

    // 배치로 데이터 삽입
    for (const record of sleepRecordsData) {
      await db.insert(sleepRecords).values(record)
    }

    console.log(`✅ ${sleepRecordsData.length}개의 더미 수면 기록이 생성되었습니다.`)
    console.log(`📊 수면 시간 범위: 4.0~9.0시간, 메모: ${dummyNotes.join(', ')}`)
  } catch (error) {
    console.error('더미 수면 기록 데이터 삽입 중 오류:', error)
  }
}

// 데이터베이스 마이그레이션 및 초기 데이터 삽입
async function runMigration() {
  try {
    // 데이터베이스 디렉토리 생성
    await ensureDatabaseDirectory()

    // 데이터베이스 연결
    const sqlite = new Database(env.DATABASE_URL)
    const db = drizzle(sqlite)

    // 스키마 생성
    console.log('데이터베이스 스키마 생성 중...')

    // users 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'USER',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // sleep_records 테이블 생성
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sleep_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        hours INTEGER NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)

    // 초기 데이터 삽입
    console.log('초기 데이터 삽입 중...')

    // 기존 데이터 확인
    const existingUsers = await db.select().from(users)
    console.log(`기존 사용자 수: ${existingUsers.length}`)

    if (existingUsers.length === 0) {
      // 초기 사용자 데이터 삽입
      for (const user of initialUsers) {
        await db.insert(users).values(user)
      }
      console.log(`${initialUsers.length}명의 사용자가 추가되었습니다.`)
    } else {
      console.log('사용자 데이터가 이미 존재합니다. 초기 데이터 삽입을 건너뜁니다.')
    }

    // 더미 수면 기록 데이터 삽입 (개발/테스트용)
    // 실제 프로덕션에서는 NODE_ENV 조건으로 비활성화
    if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
      await insertDummySleepRecords(db)
    }

    console.log('데이터베이스 마이그레이션이 완료되었습니다.')
  } catch (error) {
    console.error('데이터베이스 마이그레이션 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행된 경우에만 마이그레이션 실행
if (require.main === module) {
  runMigration()
}

export default runMigration
