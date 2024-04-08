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

export const delayExecution = <T>(callback: () => T, delay: number) => {
    return new Promise<T>((resolve) => {
        const timeoutId = setTimeout(() => {
            const result = callback()
            resolve(result)
            clearTimeout(timeoutId)
        }, delay)
    })
}
