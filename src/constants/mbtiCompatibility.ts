import { MBTICompatibility, MBTIType } from './enums'

const MBTI_COMPATIBILITY: Record<MBTIType, Record<MBTIType, MBTICompatibility>> = {
    INFP: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Best,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Best,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Worst,
        ESFP: MBTICompatibility.Worst,
        ISTP: MBTICompatibility.Worst,
        ESTP: MBTICompatibility.Worst,
        ISFJ: MBTICompatibility.Worst,
        ESFJ: MBTICompatibility.Worst,
        ISTJ: MBTICompatibility.Worst,
        ESTJ: MBTICompatibility.Worst
    },
    ENFP: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Best,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Best,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Worst,
        ESFP: MBTICompatibility.Worst,
        ISTP: MBTICompatibility.Worst,
        ESTP: MBTICompatibility.Worst,
        ISFJ: MBTICompatibility.Worst,
        ESFJ: MBTICompatibility.Worst,
        ISTJ: MBTICompatibility.Worst,
        ESTJ: MBTICompatibility.Worst
    },
    INFJ: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Best,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Best,
        ISFP: MBTICompatibility.Worst,
        ESFP: MBTICompatibility.Worst,
        ISTP: MBTICompatibility.Worst,
        ESTP: MBTICompatibility.Worst,
        ISFJ: MBTICompatibility.Worst,
        ESFJ: MBTICompatibility.Worst,
        ISTJ: MBTICompatibility.Worst,
        ESTJ: MBTICompatibility.Worst
    },
    ENFJ: {
        INFP: MBTICompatibility.Best,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Best,
        ESFP: MBTICompatibility.Worst,
        ISTP: MBTICompatibility.Worst,
        ESTP: MBTICompatibility.Worst,
        ISFJ: MBTICompatibility.Worst,
        ESFJ: MBTICompatibility.Worst,
        ISTJ: MBTICompatibility.Worst,
        ESTJ: MBTICompatibility.Worst
    },
    INTJ: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Best,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Best,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Bad,
        ESFJ: MBTICompatibility.Bad,
        ISTJ: MBTICompatibility.Bad,
        ESTJ: MBTICompatibility.Bad
    },
    ENTJ: {
        INFP: MBTICompatibility.Best,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Best,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Average,
        ESFJ: MBTICompatibility.Average,
        ISTJ: MBTICompatibility.Average,
        ESTJ: MBTICompatibility.Average
    },
    INTP: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Good,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Good,
        ENTJ: MBTICompatibility.Best,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Bad,
        ESFJ: MBTICompatibility.Bad,
        ISTJ: MBTICompatibility.Bad,
        ESTJ: MBTICompatibility.Best
    },
    ENTP: {
        INFP: MBTICompatibility.Good,
        ENFP: MBTICompatibility.Good,
        INFJ: MBTICompatibility.Best,
        ENFJ: MBTICompatibility.Good,
        INTJ: MBTICompatibility.Best,
        ENTJ: MBTICompatibility.Good,
        INTP: MBTICompatibility.Good,
        ENTP: MBTICompatibility.Good,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Bad,
        ESFJ: MBTICompatibility.Bad,
        ISTJ: MBTICompatibility.Bad,
        ESTJ: MBTICompatibility.Bad
    },
    ISFP: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Best,
        INTJ: MBTICompatibility.Average,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Average,
        ENTP: MBTICompatibility.Average,
        ISFP: MBTICompatibility.Bad,
        ESFP: MBTICompatibility.Bad,
        ISTP: MBTICompatibility.Bad,
        ESTP: MBTICompatibility.Bad,
        ISFJ: MBTICompatibility.Average,
        ESFJ: MBTICompatibility.Best,
        ISTJ: MBTICompatibility.Average,
        ESTJ: MBTICompatibility.Best
    },
    ESFP: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Average,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Average,
        ENTP: MBTICompatibility.Average,
        ISFP: MBTICompatibility.Bad,
        ESFP: MBTICompatibility.Bad,
        ISTP: MBTICompatibility.Bad,
        ESTP: MBTICompatibility.Bad,
        ISFJ: MBTICompatibility.Best,
        ESFJ: MBTICompatibility.Average,
        ISTJ: MBTICompatibility.Best,
        ESTJ: MBTICompatibility.Average
    },
    ISTP: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Average,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Average,
        ENTP: MBTICompatibility.Average,
        ISFP: MBTICompatibility.Bad,
        ESFP: MBTICompatibility.Bad,
        ISTP: MBTICompatibility.Bad,
        ESTP: MBTICompatibility.Bad,
        ISFJ: MBTICompatibility.Average,
        ESFJ: MBTICompatibility.Best,
        ISTJ: MBTICompatibility.Average,
        ESTJ: MBTICompatibility.Best
    },
    ESTP: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Average,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Average,
        ENTP: MBTICompatibility.Average,
        ISFP: MBTICompatibility.Bad,
        ESFP: MBTICompatibility.Bad,
        ISTP: MBTICompatibility.Bad,
        ESTP: MBTICompatibility.Bad,
        ISFJ: MBTICompatibility.Best,
        ESFJ: MBTICompatibility.Average,
        ISTJ: MBTICompatibility.Best,
        ESTJ: MBTICompatibility.Average
    },
    ISFJ: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Bad,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Bad,
        ENTP: MBTICompatibility.Bad,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Best,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Best,
        ISFJ: MBTICompatibility.Good,
        ESFJ: MBTICompatibility.Good,
        ISTJ: MBTICompatibility.Good,
        ESTJ: MBTICompatibility.Good
    },
    ESFJ: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Bad,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Bad,
        ENTP: MBTICompatibility.Bad,
        ISFP: MBTICompatibility.Best,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Best,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Good,
        ESFJ: MBTICompatibility.Good,
        ISTJ: MBTICompatibility.Good,
        ESTJ: MBTICompatibility.Good
    },
    ISTJ: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Bad,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Bad,
        ENTP: MBTICompatibility.Bad,
        ISFP: MBTICompatibility.Average,
        ESFP: MBTICompatibility.Best,
        ISTP: MBTICompatibility.Average,
        ESTP: MBTICompatibility.Best,
        ISFJ: MBTICompatibility.Good,
        ESFJ: MBTICompatibility.Good,
        ISTJ: MBTICompatibility.Good,
        ESTJ: MBTICompatibility.Good
    },
    ESTJ: {
        INFP: MBTICompatibility.Worst,
        ENFP: MBTICompatibility.Worst,
        INFJ: MBTICompatibility.Worst,
        ENFJ: MBTICompatibility.Worst,
        INTJ: MBTICompatibility.Bad,
        ENTJ: MBTICompatibility.Average,
        INTP: MBTICompatibility.Best,
        ENTP: MBTICompatibility.Bad,
        ISFP: MBTICompatibility.Best,
        ESFP: MBTICompatibility.Average,
        ISTP: MBTICompatibility.Best,
        ESTP: MBTICompatibility.Average,
        ISFJ: MBTICompatibility.Good,
        ESFJ: MBTICompatibility.Good,
        ISTJ: MBTICompatibility.Good,
        ESTJ: MBTICompatibility.Good
    }
}

export default MBTI_COMPATIBILITY
