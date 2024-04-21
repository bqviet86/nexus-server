import { ObjectId } from 'mongodb'

import { MBTI_QUESTION_MESSAGES } from '~/constants/messages'
import MBTIQuestion from '~/models/schemas/MBTIQuestion.schema'
import { CreateMBTIQuestionReqBody, UpdateMBTIQuestionReqBody } from '~/models/requests/MBTIQuestion.requests'
import databaseService from './database.services'

class MBTIQuestionService {
    async getAllMBTIQuestions({ question, page, limit }: { question?: string; page: number; limit: number }) {
        const [{ mbti_questions, total_mbti_questions }] = await databaseService.mbtiQuestions
            .aggregate<{
                mbti_questions: MBTIQuestion[]
                total_mbti_questions: number
            }>([
                {
                    $match: {
                        ...(question ? { question: new RegExp(question, 'i') } : {})
                    }
                },
                {
                    $facet: {
                        mbti_questions: [
                            {
                                $skip: (page - 1) * limit
                            },
                            {
                                $limit: limit
                            }
                        ],
                        total: [
                            {
                                $count: 'total_mbti_questions'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: '$total',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        mbti_questions: '$mbti_questions',
                        total_mbti_questions: '$total.total_mbti_questions'
                    }
                }
            ])
            .toArray()

        return {
            mbti_questions: mbti_questions || [],
            total_mbti_questions: total_mbti_questions || 0
        }
    }

    async createMBTIQuestion(payload: CreateMBTIQuestionReqBody) {
        const result = await databaseService.mbtiQuestions.insertOne(new MBTIQuestion(payload))
        const question = await databaseService.mbtiQuestions.findOne({
            _id: result.insertedId
        })

        return question
    }

    async updateMBTIQuestion(mbti_question_id: string, payload: UpdateMBTIQuestionReqBody) {
        const { question, dimension, options } = payload
        const mbtiQuestion = await databaseService.mbtiQuestions.findOneAndUpdate(
            {
                _id: new ObjectId(mbti_question_id)
            },
            {
                $set: {
                    ...(question ? { question } : {}),
                    ...(dimension ? { dimension } : {}),
                    ...(options ? { options } : {})
                },
                $currentDate: {
                    updated_at: true
                }
            },
            {
                returnDocument: 'after',
                includeResultMetadata: false
            }
        )

        return mbtiQuestion
    }

    async deleteMBTIQuestion(mbti_question_id: string) {
        await databaseService.mbtiQuestions.deleteOne({
            _id: new ObjectId(mbti_question_id)
        })

        return { message: MBTI_QUESTION_MESSAGES.DELETE_MBTI_QUESTION_SUCCESS }
    }
}

const mbtiQuestionService = new MBTIQuestionService()

export default mbtiQuestionService
