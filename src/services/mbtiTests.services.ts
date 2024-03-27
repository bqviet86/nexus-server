import { Document, ObjectId } from 'mongodb'
import { shuffle } from 'lodash'

import { MBTIDimension, MBTITestStatus, MBTIType, MBTIValue } from '~/constants/enums'
import { MBTI_TEST_MESSAGES } from '~/constants/messages'
import DatingUser from '~/models/schemas/DatingUser.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'
import MBTIQuestion from '~/models/schemas/MBTIQuestion.schema'
import databaseService from './database.services'

class MBTITestService {
    commonAggregateMBTITest({
        mbti_test_id,
        dating_profile_id
    }: {
        mbti_test_id?: string
        dating_profile_id: string
    }): Document[] {
        return [
            {
                $match: {
                    ...(mbti_test_id ? { _id: new ObjectId(mbti_test_id) } : {}),
                    dating_user_id: new ObjectId(dating_profile_id)
                }
            },
            {
                $addFields: {
                    current_question: {
                        $indexOfArray: [
                            {
                                $map: {
                                    input: '$answers',
                                    as: 'mbti_answer',
                                    in: '$$mbti_answer.answer'
                                }
                            },
                            ''
                        ]
                    }
                }
            },
            {
                $addFields: {
                    current_question: {
                        $cond: {
                            if: {
                                $eq: ['$current_question', -1]
                            },
                            then: null,
                            else: {
                                $add: ['$current_question', 1]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'mbti_questions',
                    localField: 'answers.question_id',
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
                    answers: {
                        $map: {
                            input: '$answers',
                            as: 'mbti_answer',
                            in: {
                                question: {
                                    $arrayElemAt: [
                                        '$questions',
                                        {
                                            $indexOfArray: ['$question_ids', '$$mbti_answer.question_id']
                                        }
                                    ]
                                },
                                answer: '$$mbti_answer.answer'
                            }
                        }
                    }
                }
            },
            {
                $sort: {
                    created_at: -1
                }
            },
            {
                $project: {
                    dating_user_id: 0,
                    questions: 0,
                    question_ids: 0
                }
            }
        ]
    }

    async createMBTITest(dating_profile: DatingUser) {
        const dimensionQuestionsSize = 9
        const mbtiQuestions = shuffle(
            (
                await databaseService.mbtiQuestions
                    .aggregate<{ questions: MBTIQuestion[] }>([
                        {
                            $facet: {
                                EI_questions: [
                                    {
                                        $match: {
                                            dimension: MBTIDimension.EI
                                        }
                                    },
                                    {
                                        $sample: {
                                            size: dimensionQuestionsSize
                                        }
                                    }
                                ],
                                SN_questions: [
                                    {
                                        $match: {
                                            dimension: MBTIDimension.SN
                                        }
                                    },
                                    {
                                        $sample: {
                                            size: dimensionQuestionsSize
                                        }
                                    }
                                ],
                                TF_questions: [
                                    {
                                        $match: {
                                            dimension: MBTIDimension.TF
                                        }
                                    },
                                    {
                                        $sample: {
                                            size: dimensionQuestionsSize
                                        }
                                    }
                                ],
                                JP_questions: [
                                    {
                                        $match: {
                                            dimension: MBTIDimension.JP
                                        }
                                    },
                                    {
                                        $sample: {
                                            size: dimensionQuestionsSize
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                questions: {
                                    $concatArrays: ['$EI_questions', '$SN_questions', '$TF_questions', '$JP_questions']
                                }
                            }
                        }
                    ])
                    .toArray()
            )[0].questions
        )
        const result = await databaseService.mbtiTests.insertOne(
            new MBTITest({
                dating_user_id: dating_profile._id as ObjectId,
                answers: mbtiQuestions.map((question) => ({
                    question_id: question._id as ObjectId,
                    answer: ''
                }))
            })
        )
        const mbtiTest = (await databaseService.mbtiTests.findOne(
            { _id: result.insertedId },
            {
                projection: {
                    dating_user_id: 0
                }
            }
        )) as MBTITest

        ;(mbtiTest as any).answers = mbtiTest.answers.map((_, index) => ({
            question: mbtiQuestions[index],
            answer: ''
        }))
        ;(mbtiTest as any).current_question = 1

        return mbtiTest
    }

    async getAllMBTITests(dating_profile: DatingUser) {
        const mbtiTests = await databaseService.mbtiTests
            .aggregate<MBTITest>(
                this.commonAggregateMBTITest({
                    dating_profile_id: (dating_profile._id as ObjectId).toString()
                })
            )
            .toArray()

        return mbtiTests
    }

    async updateAnswerMBTITest({
        mbti_test,
        question_id,
        answer
    }: {
        mbti_test: MBTITest
        question_id: string
        answer: MBTIValue
    }) {
        const updatedAnswers = mbti_test.answers.map((mbtiAnswer) => ({
            question_id: (mbtiAnswer as any).question._id,
            answer: (mbtiAnswer as any).question._id.equals(question_id) ? answer : mbtiAnswer.answer
        }))
        const mbtiTest = await databaseService.mbtiTests.findOneAndUpdate(
            {
                _id: mbti_test._id
            },
            {
                $set: {
                    answers: updatedAnswers,
                    status: MBTITestStatus.Processing
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

        return mbtiTest
    }

    async completeMBTITest(mbti_test: MBTITest) {
        const answers = mbti_test.answers.map((mbtiAnswer) => mbtiAnswer.answer as MBTIValue)
        const { E, I, S, N, T, F, J, P } = answers.reduce(
            (acc, answer) => ({
                ...acc,
                [answer]: acc[answer] + 1
            }),
            { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
        )
        const mbtiType = `${E > I ? 'E' : 'I'}${S > N ? 'S' : 'N'}${T > F ? 'T' : 'F'}${J > P ? 'J' : 'P'}` as MBTIType
        const mbtiTest = await databaseService.mbtiTests.findOneAndUpdate(
            {
                _id: mbti_test._id as ObjectId
            },
            {
                $set: {
                    mbti_type: mbtiType,
                    status: MBTITestStatus.Completed
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

        return mbtiTest
    }

    async deleteMBTITest(mbti_test_id: string) {
        await databaseService.mbtiTests.deleteOne({
            _id: new ObjectId(mbti_test_id)
        })

        return { message: MBTI_TEST_MESSAGES.DELETE_MBTI_TEST_SUCCESS }
    }
}

const mbtiTestService = new MBTITestService()

export default mbtiTestService
