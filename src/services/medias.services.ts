import { Request } from 'express'
import { config } from 'dotenv'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import mime from 'mime'

import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MediaTypes } from '~/constants/enums'
import { Media } from '~/models/Others'
import { getFiles, getNameFromFilename, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { uploadToS3 } from '~/utils/s3'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { deleteFolder } from '~/utils/dir'

config()

class EncodeQueue {
    items: string[]
    isEncoding: boolean

    constructor() {
        this.items = []
        this.isEncoding = false
    }

    enqueue(item: string) {
        this.items.push(item)
        this.processEncode()
    }

    async processEncode() {
        if (this.isEncoding) return

        if (this.items.length > 0) {
            this.isEncoding = true

            const videoPath = this.items.shift() as string
            const idName = getNameFromFilename(path.basename(videoPath))

            try {
                await encodeHLSWithMultipleVideoStreams(videoPath)
                await fsPromise.unlink(videoPath)

                const videoDirPath = path.resolve(UPLOAD_VIDEO_DIR, idName)
                const files = getFiles(videoDirPath)

                await Promise.all(
                    files.map((filepath) => {
                        // filepath: ___\server\uploads\videos\x5-rHadBNqy9ZySFBDO1E\v0\fileSequence0.ts
                        // relativePath: x5-rHadBNqy9ZySFBDO1E/v0/fileSequence0.ts
                        const relativePath = path.relative(UPLOAD_VIDEO_DIR, filepath).replace(/\\/g, '/')

                        return uploadToS3({
                            filename: `videos-hls/${relativePath}`,
                            filepath,
                            contentType: mime.getType(filepath) as string
                        })
                    })
                )
                await deleteFolder(videoDirPath)

                console.log(`Encode video ${videoPath} success`)
            } catch (error) {
                console.error(`Encode video ${videoPath} failed`)
                console.error(error)
            }

            this.isEncoding = false
            this.processEncode()
        } else {
            console.log('Encode video queue is empty')
        }
    }
}

const encodeQueue = new EncodeQueue()

class MediaService {
    async uploadImage({
        req,
        maxFiles,
        maxFileSize = 20 * 1024 * 1024 // 20mb
    }: {
        req: Request
        maxFiles: number
        maxFileSize?: number
    }) {
        const files = await handleUploadImage({ req, maxFiles, maxFileSize })
        const result: Media[] = []

        for (const file of files) {
            const newFilename = `${getNameFromFilename(file.newFilename)}.jpeg`
            const newFilepath = path.resolve(UPLOAD_IMAGE_DIR, newFilename)

            await sharp(file.filepath).jpeg({ quality: 100 }).toFile(newFilepath)
            sharp.cache(false)

            await uploadToS3({
                filename: `images/${newFilename}`,
                filepath: newFilepath,
                contentType: mime.getType(newFilepath) as string
            })

            await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newFilepath)])

            result.push({
                url: `${process.env.HOST}/static/image/${newFilename}`,
                type: MediaTypes.Image
            })
        }

        return result
    }

    async uploadVideoHLS({
        req,
        maxFiles,
        maxFileSize = 500 * 1024 * 1024 // 500mb
    }: {
        req: Request
        maxFiles: number
        maxFileSize?: number
    }) {
        const files = await handleUploadVideo({ req, maxFiles, maxFileSize })
        const result: Media[] = await Promise.all(
            files.map(async (file) => {
                const newFilename = getNameFromFilename(file.newFilename)

                encodeQueue.enqueue(file.filepath)

                return {
                    url: `${process.env.HOST}/static/video-hls/${newFilename}/master.m3u8`,
                    type: MediaTypes.Video
                }
            })
        )

        return result
    }
}

const mediaService = new MediaService()

export default mediaService
