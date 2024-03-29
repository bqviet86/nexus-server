import { RequestHandler, Request, Response, NextFunction } from 'express'

export const wrapRequestHandler = <P, ResBody, ReqBody, ReqQuery>(
    func: RequestHandler<P, ResBody, ReqBody, ReqQuery>
) => {
    return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

export const delayExecution = (callback: () => void, delay: number) => {
    return new Promise<void>((resolve) => {
        const timeoutId = setTimeout(() => {
            callback()
            resolve()
            clearTimeout(timeoutId)
        }, delay)
    })
}
