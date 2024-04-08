import { MBTICompatibility } from './enums'

export const CRITERIA_PASS_SCORE = 70

export const CRITERIA_SCORES = {
    Sex: 40,
    Age: 20,
    Height: 15,
    Hometown: 15,
    Language: 10
}

export const MBTI_COMPATIBILITY_SCORES: Record<MBTICompatibility, number> = {
    Best: 100,
    Good: 75,
    Average: 50,
    Bad: 25,
    Worst: 0
}
