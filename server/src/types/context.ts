import { UserService } from '../services/userService'
import { SleepRecordService } from '../services/sleepRecordService'

export type AppContext = {
  userService: UserService
  sleepRecordService: SleepRecordService
}
