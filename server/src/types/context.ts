import { UserService } from '../services/userService'
import { SleepRecordService } from '../services/sleepRecordService'
import { AIAdvisorService } from '../services/aiAdvisorService'

export type AppContext = {
  userService: UserService
  sleepRecordService: SleepRecordService
  aiAdvisorService: AIAdvisorService
}
