import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import formidable, { File } from 'formidable'

import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MEDIAS_MESSAGES } from '~/constants/messages'

export const initFolder = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {
            recursive: true
        })
    }
}

export const getNameFromFilename = (filename: string) => {
    const ext = path.extname(filename)

    return filename.replace(ext, '')
}

export const getExtensionFromFilename = (filename: string) => {
    const ext = path.extname(filename)

    return ext.slice(1)
}

export const handleUploadImage = ({
    req,
    maxFiles,
    maxFileSize
}: {
    req: Request
    maxFiles: number
    maxFileSize: number
}) => {
    const form = formidable({
        uploadDir: UPLOAD_IMAGE_TEMP_DIR,
        keepExtensions: true,
        multiples: true,
        maxFiles,
        maxFileSize,
        maxTotalFileSize: maxFiles * maxFileSize,
        filter: ({ name, originalFilename, mimetype }) => {
            const valid = name === 'image' && Boolean(mimetype?.includes('image'))

            if (!valid) {
                form.emit('error' as any, new Error(MEDIAS_MESSAGES.INVALID_FILE_TYPE) as any)
            }

            return valid
        }
    })

    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err)
            }

            if (!files.image) {
                return reject(new Error(MEDIAS_MESSAGES.NO_IMAGE_PROVIDED))
            }

            resolve(files.image)
        })
    })
}

export const handleUploadVideo = async ({
    req,
    maxFiles,
    maxFileSize
}: {
    req: Request
    maxFiles: number
    maxFileSize: number
}) => {
    const form = formidable({
        multiples: true,
        maxFiles,
        maxFileSize,
        maxTotalFileSize: maxFiles * maxFileSize,
        filter: ({ name, originalFilename, mimetype }) => {
            const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))

            if (!valid) {
                form.emit('error' as any, new Error(MEDIAS_MESSAGES.INVALID_FILE_TYPE) as any)
            }

            return valid
        }
    })
    const { nanoid } = await import('nanoid')

    return new Promise<File[]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err)
            }

            if (!files.video) {
                return reject(new Error(MEDIAS_MESSAGES.NO_VIDEO_PROVIDED))
            }

            const videos = files.video

            videos.forEach((video) => {
                const idName = nanoid()
                const uploadDir = path.resolve(UPLOAD_VIDEO_DIR, idName)

                initFolder(uploadDir)

                const ext = getExtensionFromFilename(video.originalFilename as string)
                const newFilePath = path.join(uploadDir, `${idName}.${ext}`)

                fs.renameSync(video.filepath, newFilePath)
                video.filepath = newFilePath
                video.newFilename = `${idName}.${ext}`
            })

            resolve(videos)
        })
    })
}

export const getFiles = (dir: string, files: string[] = []) => {
    const fileList = fs.readdirSync(dir)

    for (const file of fileList) {
        const name = `${dir}/${file}`

        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files)
        } else {
            files.push(name)
        }
    }

    return files
}
