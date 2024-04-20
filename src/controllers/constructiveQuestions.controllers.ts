import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { CONSTRUCTIVE_QUESTIONS_MESSAGES } from '~/constants/messages'
import {
    CreateConstructiveQuestionReqBody,
    DeleteConstructiveQuestionReqParams,
    GetAllConstructiveQuestionsReqQuery,
    UpdateConstructiveQuestionReqBody,
    UpdateConstructiveQuestionReqParams
} from '~/models/requests/ConstructiveQuestions.requests'
import constructiveQuestionService from '~/services/constructiveQuestions.services'

export const getAllConstructiveQuestionsController = async (
    req: Request<ParamsDictionary, any, any, GetAllConstructiveQuestionsReqQuery>,
    res: Response
) => {
    const { question } = req.query
    const page = Number(req.query.page)
    const limit = Number(req.query.limit)
    const { constructive_questions, total_constructive_questions } =
        await constructiveQuestionService.getAllConstructiveQuestions({
            question,
            page,
            limit
        })

    return res.json({
        message: CONSTRUCTIVE_QUESTIONS_MESSAGES.GET_ALL_CONSTRUCTIVE_QUESTIONS_SUCCESS,
        result: {
            constructive_questions,
            page,
            limit,
            total_pages: Math.ceil(total_constructive_questions / limit)
        }
    })
}

export const createConstructiveQuestionController = async (
    req: Request<ParamsDictionary, any, CreateConstructiveQuestionReqBody>,
    res: Response
) => {
    const result = await constructiveQuestionService.createConstructiveQuestion(req.body)

    return res.json({
        message: CONSTRUCTIVE_QUESTIONS_MESSAGES.CREATE_CONSTRUCTIVE_QUESTION_SUCCESS,
        result
    })
}

export const updateConstructiveQuestionController = async (
    req: Request<UpdateConstructiveQuestionReqParams, any, UpdateConstructiveQuestionReqBody>,
    res: Response
) => {
    const { constructive_question_id } = req.params
    const result = await constructiveQuestionService.updateConstructiveQuestion(constructive_question_id, req.body)

    return res.json({
        message: CONSTRUCTIVE_QUESTIONS_MESSAGES.UPDATE_CONSTRUCTIVE_QUESTION_SUCCESS,
        result
    })
}

export const deleteConstructiveQuestionController = async (
    req: Request<DeleteConstructiveQuestionReqParams>,
    res: Response
) => {
    const { constructive_question_id } = req.params
    const result = await constructiveQuestionService.deleteConstructiveQuestion(constructive_question_id)

    return res.json(result)
}
