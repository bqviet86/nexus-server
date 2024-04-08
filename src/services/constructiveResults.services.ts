import { Document, ObjectId } from 'mongodb'
import { shuffle } from 'lodash'

import {
    CreateConstructiveResultReqBody,
    UpdateAnswerConstructiveResultReqBody
} from '~/models/requests/ConstructiveResult.requests'
import ConstructiveResult from '~/models/schemas/ConstructiveResult.schema'
import ConstructiveQuestion from '~/models/schemas/ConstructiveQuestion.schema'
import { ConstructiveAnswer } from '~/models/Types'
import databaseService from './database.services'
import { delayExecution } from '~/utils/handlers'
import { io, socketUsers } from '~/utils/socket'

class ConstructiveResultService {
    private constructiveQuestionsSize = 6
    private commonAggregateConstructiveResults: Document[] = [
        {
            $lookup: {
                from: 'constructive_questions',
                localField: 'first_user.answers.question_id',
                foreignField: '_id',
                as: 'questions'
            }
        },
        {
            $addFields: {
                question_ids: {
                    $map: {
                        input: '$questions',
                        as: 'question',
                        in: '$$question._id'
                    }
                }
            }
        },
        {
            $addFields: {
                'first_user.answers': {
                    $map: {
                        input: '$first_user.answers',
                        as: 'constructive_answer',
                        in: {
                            question: {
                                $arrayElemAt: [
                                    '$questions',
                                    {
                                        $indexOfArray: ['$question_ids', '$$constructive_answer.question_id']
                                    }
                                ]
                            },
                            answer: '$$constructive_answer.answer'
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                'second_user.answers': {
                    $map: {
                        input: '$second_user.answers',
                        as: 'constructive_answer',
                        in: {
                            question: {
                                $arrayElemAt: [
                                    '$questions',
                                    {
                                        $indexOfArray: ['$question_ids', '$$constructive_answer.question_id']
                                    }
                                ]
                            },
                            answer: '$$constructive_answer.answer'
                        }
                    }
                }
            }
        },
        {
            $project: {
                questions: 0,
                question_ids: 0
            }
        }
    ]

    async createConstructiveResult(payload: CreateConstructiveResultReqBody) {
        const constructiveQuestions = shuffle(
            await databaseService.constructiveQuestions
                .aggregate<ConstructiveQuestion>([
                    {
                        $sample: {
                            size: this.constructiveQuestionsSize
                        }
                    }
                ])
                .toArray()
        )
        const constructiveAnswers: ConstructiveAnswer[] = constructiveQuestions.map((question) => ({
            question_id: question._id as ObjectId,
            answer: ''
        }))

        const result = await databaseService.constructiveResults.insertOne(
            new ConstructiveResult({
                first_user: {
                    id: new ObjectId(payload.first_user_id),
                    answers: constructiveAnswers
                },
                second_user: {
                    id: new ObjectId(payload.second_user_id),
                    answers: constructiveAnswers
                }
            })
        )
        const constructiveResult = (await databaseService.constructiveResults.findOne({
            _id: result.insertedId
        })) as ConstructiveResult

        const constructiveAnswersDetail = constructiveQuestions.map((question) => ({
            question,
            answer: ''
        }))

        ;(constructiveResult as any).first_user.answers = constructiveAnswersDetail
        ;(constructiveResult as any).second_user.answers = constructiveAnswersDetail

        return constructiveResult
    }

    async getConstructiveResult(constructive_result_id: string) {
        const [constructiveResult] = await databaseService.constructiveResults
            .aggregate<ConstructiveResult>([
                {
                    $match: {
                        _id: new ObjectId(constructive_result_id)
                    }
                },
                ...this.commonAggregateConstructiveResults
            ])
            .toArray()

        return constructiveResult
    }

    async updateAnswerConstructiveResult({
        constructiveResult,
        payload,
        me,
        my_id,
        user_id
    }: {
        constructiveResult: ConstructiveResult
        payload: UpdateAnswerConstructiveResultReqBody
        me: 'first_user' | 'second_user'
        my_id: string
        user_id: string
    }) {
        const updatedAnswers = constructiveResult[me].answers.map((constructiveAnswer) => ({
            question_id: constructiveAnswer.question_id,
            answer: constructiveAnswer.question_id.equals(new ObjectId(payload.question_id))
                ? payload.answer
                : constructiveAnswer.answer
        }))
        let compatibility: number | null = 0

        for (let i = 0; i < this.constructiveQuestionsSize; i++) {
            const userAnswer = constructiveResult[me === 'first_user' ? 'second_user' : 'first_user'].answers[i].answer

            if (updatedAnswers[i].answer && userAnswer) {
                if (updatedAnswers[i].answer === userAnswer) {
                    compatibility++
                }
            } else {
                compatibility = null
                break
            }
        }

        await databaseService.constructiveResults.updateOne(
            {
                _id: constructiveResult._id
            },
            {
                $set: {
                    [`${me}.answers`]: updatedAnswers,
                    compatibility: compatibility && Math.round((compatibility / this.constructiveQuestionsSize) * 100)
                },
                $currentDate: {
                    updated_at: true
                }
            }
        )

        const [result] = await databaseService.constructiveResults
            .aggregate<ConstructiveResult>([
                {
                    $match: {
                        _id: constructiveResult._id
                    }
                },
                ...this.commonAggregateConstructiveResults
            ])
            .toArray()

        if (compatibility) {
            await delayExecution(() => {
                if (socketUsers[my_id] && socketUsers[user_id]) {
                    socketUsers[my_id].socket_ids.concat(socketUsers[user_id].socket_ids).forEach((socket_id) => {
                        io.to(socket_id).emit('complete_constructive_game', result)
                    })
                }
            }, 300)
        }

        return result
    }
}

const constructiveResultService = new ConstructiveResultService()

export default constructiveResultService
