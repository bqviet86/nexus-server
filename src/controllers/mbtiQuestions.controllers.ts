import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { MBTI_QUESTION_MESSAGES } from '~/constants/messages'
import {
    CreateMBTIQuestionReqBody,
    DeleteMBTIQuestionReqParams,
    GetAllMbtiQuestionsReqQuery,
    UpdateMBTIQuestionReqBody,
    UpdateMBTIQuestionReqParams
} from '~/models/requests/MBTIQuestion.requests'
import mbtiQuestionService from '~/services/mbtiQuestions.services'

export const getAllMBTIQuestionsController = async (
    req: Request<ParamsDictionary, any, any, GetAllMbtiQuestionsReqQuery>,
    res: Response
) => {
    const { question } = req.query
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const { mbti_questions, total_mbti_questions } = await mbtiQuestionService.getAllMBTIQuestions({
        question,
        page,
        limit
    })

    return res.json({
        message: MBTI_QUESTION_MESSAGES.GET_ALL_MBTI_QUESTIONS_SUCCESS,
        result: {
            mbti_questions,
            page,
            limit,
            total_pages: Math.ceil(total_mbti_questions / limit)
        }
    })
}

export const createMBTIQuestionController = async (
    req: Request<ParamsDictionary, any, CreateMBTIQuestionReqBody>,
    res: Response
) => {
    const result = await mbtiQuestionService.createMBTIQuestion(req.body)

    return res.json({
        message: MBTI_QUESTION_MESSAGES.CREATE_MBTI_QUESTION_SUCCESS,
        result
    })
}

export const updateMBTIQuestionController = async (
    req: Request<UpdateMBTIQuestionReqParams, any, UpdateMBTIQuestionReqBody>,
    res: Response
) => {
    const { mbti_question_id } = req.params
    const result = await mbtiQuestionService.updateMBTIQuestion(mbti_question_id, req.body)

    return res.json({
        message: MBTI_QUESTION_MESSAGES.UPDATE_MBTI_QUESTION_SUCCESS,
        result
    })
}

export const deleteMBTIQuestionController = async (req: Request<DeleteMBTIQuestionReqParams>, res: Response) => {
    const { mbti_question_id } = req.params
    const result = await mbtiQuestionService.deleteMBTIQuestion(mbti_question_id)

    return res.json(result)
}
