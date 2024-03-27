import { Request, Response } from 'express'

import { MBTI_TEST_MESSAGES } from '~/constants/messages'
import {
    CompleteMBTITestReqParams,
    DeleteMBTITestReqParams,
    GetMBTITestReqParams,
    UpdateAnswerMBTITestReqBody,
    UpdateAnswerMBTITestReqParams
} from '~/models/requests/MBTITest.requests'
import DatingUser from '~/models/schemas/DatingUser.schema'
import MBTITest from '~/models/schemas/MBTITest.schema'
import mbtiTestService from '~/services/mbtiTests.services'

export const createMBTITestController = async (req: Request, res: Response) => {
    const dating_profile = req.dating_profile as DatingUser
    const result = await mbtiTestService.createMBTITest(dating_profile)

    return res.json({
        message: MBTI_TEST_MESSAGES.CREATE_MBTI_TEST_SUCCESS,
        result
    })
}

export const getMBTITestController = async (req: Request<GetMBTITestReqParams>, res: Response) => {
    const mbti_test = req.mbti_test as MBTITest

    return res.json({
        message: MBTI_TEST_MESSAGES.GET_MBTI_TEST_SUCCESS,
        result: mbti_test
    })
}

export const getAllMBTITestsController = async (req: Request, res: Response) => {
    const dating_profile = req.dating_profile as DatingUser
    const result = await mbtiTestService.getAllMBTITests(dating_profile)

    return res.json({
        message: MBTI_TEST_MESSAGES.GET_ALL_MBTI_TESTS_SUCCESS,
        result
    })
}

export const updateAnswerMBTITestController = async (
    req: Request<UpdateAnswerMBTITestReqParams, any, UpdateAnswerMBTITestReqBody>,
    res: Response
) => {
    const mbti_test = req.mbti_test as MBTITest
    const { question_id, answer } = req.body
    const result = await mbtiTestService.updateAnswerMBTITest({ mbti_test, question_id, answer })

    return res.json({
        message: MBTI_TEST_MESSAGES.UPDATE_ANSWER_MBTI_TEST_SUCCESS,
        result
    })
}

export const completeMBTITestController = async (req: Request<CompleteMBTITestReqParams>, res: Response) => {
    const mbti_test = req.mbti_test as MBTITest
    const result = await mbtiTestService.completeMBTITest(mbti_test)

    return res.json({
        message: MBTI_TEST_MESSAGES.COMPLETE_MBTI_TEST_SUCCESS,
        result
    })
}

export const deleteMBTITestController = async (req: Request<DeleteMBTITestReqParams>, res: Response) => {
    const { mbti_test_id } = req.params
    const result = await mbtiTestService.deleteMBTITest(mbti_test_id)

    return res.json(result)
}
