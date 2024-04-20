import { Document, ObjectId } from 'mongodb'

import { CONSTRUCTIVE_QUESTIONS_MESSAGES } from '~/constants/messages'
import {
    CreateConstructiveQuestionReqBody,
    UpdateConstructiveQuestionReqBody
} from '~/models/requests/ConstructiveQuestions.requests'
import ConstructiveQuestion from '~/models/schemas/ConstructiveQuestion.schema'
import databaseService from './database.services'

class ConstructiveQuestionService {
    commonAggregateConstructiveQuestions: Document[] = [
        {
            $lookup: {
                from: 'constructive_results',
                localField: '_id',
                foreignField: 'first_user.answers.question_id',
                as: 'constructive_results'
            }
        },
        {
            $addFields: {
                ask_count: {
                    $size: '$constructive_results'
                }
            }
        },
        {
            $project: {
                constructive_results: 0
            }
        }
    ]

    async getAllConstructiveQuestions({ question, page, limit }: { question?: string; page: number; limit: number }) {
        const [{ constructive_questions, total_constructive_questions }] = await databaseService.constructiveQuestions
            .aggregate<{
                constructive_questions: ConstructiveQuestion[]
                total_constructive_questions: number
            }>([
                {
                    $match: {
                        ...(question ? { question: new RegExp(question, 'i') } : {})
                    }
                },
                {
                    $facet: {
                        constructive_questions: [
                            {
                                $skip: (page - 1) * limit
                            },
                            {
                                $limit: limit
                            },
                            ...this.commonAggregateConstructiveQuestions
                        ],
                        total: [
                            {
                                $count: 'total_constructive_questions'
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
                        constructive_questions: '$constructive_questions',
                        total_constructive_questions: '$total.total_constructive_questions'
                    }
                }
            ])
            .toArray()

        return {
            constructive_questions: constructive_questions || [],
            total_constructive_questions: total_constructive_questions || 0
        }
    }

    async createConstructiveQuestion(payload: CreateConstructiveQuestionReqBody) {
        const result = await databaseService.constructiveQuestions.insertOne(new ConstructiveQuestion(payload))
        const [question] = await databaseService.constructiveQuestions
            .aggregate<ConstructiveQuestion>([
                {
                    $match: {
                        _id: result.insertedId
                    }
                },
                {
                    $addFields: {
                        ask_count: 0
                    }
                }
            ])
            .toArray()

        return question
    }

    async updateConstructiveQuestion(constructive_question_id: string, payload: UpdateConstructiveQuestionReqBody) {
        const { question, options } = payload

        await databaseService.constructiveQuestions.updateOne(
            { _id: new ObjectId(constructive_question_id) },
            {
                $set: {
                    ...(question ? { question } : {}),
                    ...(options ? { options } : {})
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        const [constructiveQuestion] = await databaseService.constructiveQuestions
            .aggregate<ConstructiveQuestion>([
                {
                    $match: {
                        _id: new ObjectId(constructive_question_id)
                    }
                },
                ...this.commonAggregateConstructiveQuestions
            ])
            .toArray()

        return constructiveQuestion
    }

    async deleteConstructiveQuestion(constructive_question_id: string) {
        await databaseService.constructiveQuestions.deleteOne({
            _id: new ObjectId(constructive_question_id)
        })

        return { message: CONSTRUCTIVE_QUESTIONS_MESSAGES.DELETE_CONSTRUCTIVE_QUESTION_SUCCESS }
    }
}

const constructiveQuestionService = new ConstructiveQuestionService()

export default constructiveQuestionService
