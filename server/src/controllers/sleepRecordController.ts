import { FastifyRequest, FastifyReply } from 'fastify'
import { createSuccessResponse, createErrorResponse } from '../utils/response'
import { CreateSleepRecordDto, UpdateSleepRecordDto } from '../types'
import { SleepRecordService } from '../services/sleepRecordService'

type SleepRecordControllerDeps = {
  sleepRecordService: SleepRecordService
}

export const createSleepRecordController = ({ sleepRecordService }: SleepRecordControllerDeps) => {
  const getAllSleepRecords = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sleepRecords = await sleepRecordService.getAllSleepRecords()
      return reply.code(200).send(createSuccessResponse(sleepRecords))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 목록을 불러오는데 실패했습니다.'))
    }
  }

  const getSleepRecordById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const sleepRecord = await sleepRecordService.getSleepRecordById(id)

      if (!sleepRecord) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      return reply.code(200).send(createSuccessResponse(sleepRecord))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 정보를 불러오는데 실패했습니다.'))
    }
  }

  const createSleepRecord = async (
    request: FastifyRequest<{ Body: CreateSleepRecordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const sleepRecordData = request.body

      // 날짜 형식 검증
      const datePattern = /^\d{4}-\d{2}-\d{2}$/
      if (!datePattern.test(sleepRecordData.date)) {
        return reply.code(400).send(createErrorResponse('날짜는 YYYY-MM-DD 형식이어야 합니다.'))
      }

      // 수면 시간 검증 (0~24시간)
      if (sleepRecordData.hours < 0 || sleepRecordData.hours > 24) {
        return reply
          .code(400)
          .send(createErrorResponse('수면 시간은 0에서 24 사이의 값이어야 합니다.'))
      }

      const newSleepRecord = await sleepRecordService.createSleepRecord(sleepRecordData)
      return reply
        .code(201)
        .send(createSuccessResponse(newSleepRecord, '수면 기록이 성공적으로 생성되었습니다.'))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 생성에 실패했습니다.'))
    }
  }

  const updateSleepRecord = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSleepRecordDto }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)
      const sleepRecordData = request.body

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const existingSleepRecord = await sleepRecordService.getSleepRecordById(id)
      if (!existingSleepRecord) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      // 날짜 형식 검증 (제공된 경우)
      if (sleepRecordData.date) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/
        if (!datePattern.test(sleepRecordData.date)) {
          return reply.code(400).send(createErrorResponse('날짜는 YYYY-MM-DD 형식이어야 합니다.'))
        }
      }

      // 수면 시간 검증 (제공된 경우)
      if (
        sleepRecordData.hours !== undefined &&
        (sleepRecordData.hours < 0 || sleepRecordData.hours > 24)
      ) {
        return reply
          .code(400)
          .send(createErrorResponse('수면 시간은 0에서 24 사이의 값이어야 합니다.'))
      }

      const updatedSleepRecord = await sleepRecordService.updateSleepRecord(id, sleepRecordData)
      return reply
        .code(200)
        .send(createSuccessResponse(updatedSleepRecord, '수면 기록이 성공적으로 수정되었습니다.'))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 수정에 실패했습니다.'))
    }
  }

  const deleteSleepRecord = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const id = parseInt(request.params.id, 10)

      if (isNaN(id)) {
        return reply.code(400).send(createErrorResponse('유효하지 않은 수면 기록 ID입니다.'))
      }

      const existingSleepRecord = await sleepRecordService.getSleepRecordById(id)
      if (!existingSleepRecord) {
        return reply.code(404).send(createErrorResponse('수면 기록을 찾을 수 없습니다.'))
      }

      const deleted = await sleepRecordService.deleteSleepRecord(id)

      if (!deleted) {
        return reply.code(500).send(createErrorResponse('수면 기록 삭제에 실패했습니다.'))
      }

      return reply
        .code(200)
        .send(createSuccessResponse(null, '수면 기록이 성공적으로 삭제되었습니다.'))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 기록 삭제에 실패했습니다.'))
    }
  }

  const getSleepStatistics = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const statistics = await sleepRecordService.getSleepStatistics()
      return reply.code(200).send(createSuccessResponse(statistics))
    } catch (error) {
      request.log.error(error)
      return reply.code(500).send(createErrorResponse('수면 통계를 불러오는데 실패했습니다.'))
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

export type SleepRecordController = ReturnType<typeof createSleepRecordController>
