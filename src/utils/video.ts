import { spawn } from 'child_process'
import path from 'path'

const MAXIMUM_BITRATE_360P = 3 * 10 ** 6 // 3Mbps
const MAXIMUM_BITRATE_720P = 5 * 10 ** 6 // 5Mbps
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6 // 8Mbps
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6 // 16Mbps

type Resolution = {
    width: number
    height: number
}

const runCommandWithImmediateOutput = (command: string, arg: string[]) => {
    return new Promise<string>((resolve, reject) => {
        const childProcess = spawn(command, arg)

        childProcess.stdout.on('data', (data) => {
            resolve(String(data).trim())
        })

        childProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error('Command failed'))
            } else {
                resolve('')
            }
        })
    })
}

const runCommandWithProgress = (command: string, arg: string[]) => {
    return new Promise<true>((resolve, reject) => {
        const childProcess = spawn(command, arg)

        childProcess.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(new Error('Command failed'))
            }
        })
    })
}

const getBitrate = async (filePath: string) => {
    const value = await runCommandWithImmediateOutput('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=bit_rate',
        '-of',
        'default=nw=1:nk=1',
        filePath
    ])

    return Number(value)
}

const getResolution = async (filePath: string) => {
    const value = await runCommandWithImmediateOutput('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'csv=s=x:p=0',
        filePath
    ])
    const resolution = value.split('x')
    const [width, height] = resolution

    return {
        width: Number(width),
        height: Number(height)
    } as Resolution
}

const getWidth = (height: number, resolution: Resolution) => {
    const width = Math.round((height * resolution.width) / resolution.height)

    return width % 2 === 0 ? width : width + 1
}

export const checkVideoHasAudio = async (filePath: string) => {
    const value = await runCommandWithImmediateOutput('ffprobe', [
        '-v',
        'error',
        '-select_streams',
        'a:0',
        '-show_entries',
        'stream=codec_type',
        '-of',
        'default=nw=1:nk=1',
        filePath
    ])

    return value.trim() === 'audio'
}

const createMapArr = (length: number, isHasAudio: boolean) => {
    const result = []

    for (let i = 0; i < length; i++) {
        result.push('-map', '0:0', ...(isHasAudio ? ['-map', '0:1'] : []))
    }

    return result
}

const createResolutionCommandArr = (
    originalResolution: Resolution,
    resolutionArr: { height: number; bitrate: number }[]
) => {
    const result = []

    for (let i = 0; i < resolutionArr.length; i++) {
        const { height, bitrate } = resolutionArr[i]
        const width = getWidth(height, originalResolution)

        result.push(`-s:v:${i}`, `${width}x${height}`, `-c:v:${i}`, 'libx264', `-b:v:${i}`, bitrate.toString())
    }

    return result
}

const createVarStreamMap = (length: number, isHasAudio: boolean) => {
    const result = []

    for (let i = 0; i < length; i++) {
        result.push(`v:${i}${isHasAudio ? `,a:${i}` : ''}`)
    }

    return result.join(' ')
}

const createArgs = async ({
    inputPath = 'input.mp4',
    originalBitrate = 5 * 10 ** 6, // 5Mbps
    originalResolution,
    resolutionArr,
    isHasAudio,
    withOriginalWidth = false,
    master_pl_name = 'master.m3u8',
    hls_time = 6,
    hls_list_size = 0,
    hls_segment_filename = 'v%v/fileSequence%d.ts',
    outputPath = 'v%v/prog_index.m3u8'
}: {
    inputPath?: string
    originalBitrate?: number
    originalResolution: Resolution
    resolutionArr: { height: number; bitrate: number }[]
    isHasAudio: boolean
    withOriginalWidth?: boolean
    master_pl_name?: string
    hls_time?: number
    hls_list_size?: number
    hls_segment_filename?: string
    outputPath?: string
}) => {
    const resolutionArrLength = resolutionArr.length

    return [
        '-y',
        '-i',
        inputPath,
        '-preset',
        'veryslow',
        '-g',
        '48',
        '-crf',
        '17',
        '-sc_threshold',
        '0',
        ...createMapArr(resolutionArrLength, isHasAudio),
        ...createResolutionCommandArr(originalResolution, resolutionArr),
        ...(withOriginalWidth
            ? [
                  `-s:v:${resolutionArrLength}`,
                  `${originalResolution.width}x${originalResolution.height}`,
                  `-c:v:${resolutionArrLength}`,
                  'libx264',
                  `-b:v:${resolutionArrLength}`,
                  originalBitrate.toString()
              ]
            : []),
        '-c:a',
        'copy',
        '-var_stream_map',
        createVarStreamMap(resolutionArrLength + (withOriginalWidth ? 1 : 0), isHasAudio),
        '-master_pl_name',
        master_pl_name,
        '-f',
        'hls',
        '-hls_time',
        hls_time.toString(),
        '-hls_list_size',
        hls_list_size.toString(),
        '-hls_segment_filename',
        hls_segment_filename,
        outputPath
    ]
}

export const encodeHLSWithMultipleVideoStreams = async (inputPath: string) => {
    const [bitrate, resolution] = await Promise.all([getBitrate(inputPath), getResolution(inputPath)])
    const isHasAudio = await checkVideoHasAudio(inputPath)
    const parent_folder = path.join(inputPath, '..')
    const outputSegmentPath = path.join(parent_folder, 'v%v/fileSequence%d.ts')
    const outputPath = path.join(parent_folder, 'v%v/prog_index.m3u8')
    const bitrate360 = bitrate > MAXIMUM_BITRATE_360P ? MAXIMUM_BITRATE_360P : bitrate
    const bitrate720 = bitrate > MAXIMUM_BITRATE_720P ? MAXIMUM_BITRATE_720P : bitrate
    const bitrate1080 = bitrate > MAXIMUM_BITRATE_1080P ? MAXIMUM_BITRATE_1080P : bitrate
    const bitrate1440 = bitrate > MAXIMUM_BITRATE_1440P ? MAXIMUM_BITRATE_1440P : bitrate

    console.log('bitrate', bitrate)
    console.log('resolution', resolution)
    console.log('isHasAudio', isHasAudio)

    const argsWithMax720 = await createArgs({
        inputPath,
        originalResolution: resolution,
        resolutionArr: [
            { height: 360, bitrate: bitrate360 },
            { height: 720, bitrate: bitrate720 }
        ],
        isHasAudio,
        hls_segment_filename: outputSegmentPath,
        outputPath
    })

    let args: string[] = argsWithMax720

    if (resolution.height > 720 && resolution.height <= 1080) {
        const argsWithMax1080 = await createArgs({
            inputPath,
            originalResolution: resolution,
            resolutionArr: [
                { height: 360, bitrate: bitrate360 },
                { height: 720, bitrate: bitrate720 },
                { height: 1080, bitrate: bitrate1080 }
            ],
            isHasAudio,
            hls_segment_filename: outputSegmentPath,
            outputPath
        })

        args = argsWithMax1080
    }

    if (resolution.height > 1080 && resolution.height <= 1440) {
        const argsWithMax1440 = await createArgs({
            inputPath,
            originalResolution: resolution,
            resolutionArr: [
                { height: 360, bitrate: bitrate360 },
                { height: 720, bitrate: bitrate720 },
                { height: 1080, bitrate: bitrate1080 },
                { height: 1440, bitrate: bitrate1440 }
            ],
            isHasAudio,
            hls_segment_filename: outputSegmentPath,
            outputPath
        })

        args = argsWithMax1440
    }

    if (resolution.height > 1440) {
        const argsWithOriginalWidth = await createArgs({
            inputPath,
            originalBitrate: bitrate,
            originalResolution: resolution,
            resolutionArr: [
                { height: 360, bitrate: bitrate360 },
                { height: 720, bitrate: bitrate720 },
                { height: 1080, bitrate: bitrate1080 }
            ],
            isHasAudio,
            withOriginalWidth: true,
            hls_segment_filename: outputSegmentPath,
            outputPath
        })

        args = argsWithOriginalWidth
    }

    console.log('Command', `ffmpeg ${args.join(' ')}`)

    await runCommandWithProgress('ffmpeg', args)
    console.log('Convert thành công')
}
