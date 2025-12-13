import { ClockProblem, ClockLanguage } from '../types';

// Norwegian number words for hours
const NORWEGIAN_HOURS: Record<number, string> = {
  0: 'tolv',
  1: 'ett',
  2: 'to',
  3: 'tre',
  4: 'fire',
  5: 'fem',
  6: 'seks',
  7: 'sju',
  8: 'åtte',
  9: 'ni',
  10: 'ti',
  11: 'elleve',
  12: 'tolv',
};

/**
 * Get the hour word in Norwegian
 */
const getHourWord = (hour: number): string => {
  return NORWEGIAN_HOURS[hour % 12];
};

/**
 * Get the next hour word in Norwegian (for "half past" and "quarter to")
 */
const getNextHourWord = (hour: number): string => {
  return NORWEGIAN_HOURS[(hour + 1) % 12];
};

/**
 * Format time as 24-hour digital format (e.g., "14:30")
 */
const formatDigital24 = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Format time as 12-hour digital format (e.g., "2:30")
 */
const formatDigital12 = (hour: number, minute: number): string => {
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')}`;
};

/**
 * Generate Norwegian time phrase for a given time
 */
export const getNorwegianTimePhrase = (hour: number, minute: number): string => {
  const hourWord = getHourWord(hour);
  const nextHourWord = getNextHourWord(hour);

  if (minute === 0) {
    // Whole hour: "klokken er ett"
    return `klokken er ${hourWord}`;
  } else if (minute === 30) {
    // Half past: In Norwegian, "halv tre" means 2:30 (half way to three)
    return `klokken er halv ${nextHourWord}`;
  } else if (minute === 15) {
    // Quarter past: "kvart over ett"
    return `klokken er kvart over ${hourWord}`;
  } else if (minute === 45) {
    // Quarter to: "kvart på to"
    return `klokken er kvart på ${nextHourWord}`;
  } else if (minute < 30) {
    // Minutes past the hour
    if (minute === 5) {
      return `klokken er fem over ${hourWord}`;
    } else if (minute === 10) {
      return `klokken er ti over ${hourWord}`;
    } else if (minute === 20) {
      return `klokken er ti på halv ${nextHourWord}`;
    } else if (minute === 25) {
      return `klokken er fem på halv ${nextHourWord}`;
    }
    return `klokken er ${minute} over ${hourWord}`;
  } else {
    // Minutes to the next hour
    const minutesTo = 60 - minute;
    if (minute === 35) {
      return `klokken er fem over halv ${nextHourWord}`;
    } else if (minute === 40) {
      return `klokken er ti over halv ${nextHourWord}`;
    } else if (minute === 50) {
      return `klokken er ti på ${nextHourWord}`;
    } else if (minute === 55) {
      return `klokken er fem på ${nextHourWord}`;
    }
    return `klokken er ${minutesTo} på ${nextHourWord}`;
  }
};

/**
 * Generate all valid answers for a given time (Norwegian + digital formats)
 */
export const getValidAnswers = (hour: number, minute: number, language: ClockLanguage): string[] => {
  const answers: string[] = [];

  // Digital formats (always valid)
  answers.push(formatDigital24(hour, minute));
  answers.push(formatDigital12(hour, minute));

  // Also accept without leading zeros
  if (hour < 10) {
    answers.push(`${hour}:${minute.toString().padStart(2, '0')}`);
  }
  if (minute < 10) {
    answers.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    answers.push(`${hour}:${minute}`);
  }

  // For whole hours, accept just the hour number
  if (minute === 0) {
    const displayHour = hour % 12 || 12;
    answers.push(String(hour)); // 24-hour format hour only
    answers.push(String(displayHour)); // 12-hour format hour only
  }

  // Language-specific phrases
  if (language === 'no') {
    const phrase = getNorwegianTimePhrase(hour, minute);
    answers.push(phrase);

    // Also accept short forms without "klokken er"
    const shortPhrase = phrase.replace('klokken er ', '');
    answers.push(shortPhrase);

    // Accept alternative spellings
    if (minute === 0) {
      answers.push(getHourWord(hour));
    } else if (minute === 30) {
      answers.push(`halv ${getNextHourWord(hour)}`);
    } else if (minute === 15) {
      answers.push(`kvart over ${getHourWord(hour)}`);
    } else if (minute === 45) {
      answers.push(`kvart på ${getNextHourWord(hour)}`);
    }
  }

  return answers;
};

/**
 * Normalize a time string by replacing common separators with ":"
 */
const normalizeTimeSeparators = (input: string): string => {
  // Replace "." and " " with ":" for time format normalization
  return input.replace(/[.\s]/g, ':');
};

/**
 * Check if a user's answer matches any valid answer (case-insensitive)
 * Allows ".", " ", and ":" as separators in digital time formats
 */
export const isValidClockAnswer = (userAnswer: string, validAnswers: string[]): boolean => {
  const trimmedAnswer = userAnswer.trim().toLowerCase();
  const normalizedUserAnswer = normalizeTimeSeparators(trimmedAnswer);

  return validAnswers.some((validAnswer) => {
    const normalizedValid = validAnswer.trim().toLowerCase();
    // Check both the original input and the normalized version
    return trimmedAnswer === normalizedValid || normalizedUserAnswer === normalizedValid;
  });
};

/**
 * Create a ClockProblem for a given time
 */
export const createClockProblem = (hour: number, minute: number, language: ClockLanguage): ClockProblem => {
  const displayAnswer = getNorwegianTimePhrase(hour, minute);
  const validAnswers = getValidAnswers(hour, minute, language);

  return {
    hour,
    minute,
    displayAnswer,
    validAnswers,
  };
};

/**
 * Generate clock problems for whole hours (lesson 1)
 * Hours from 1 to 12
 */
export const generateWholeHourProblems = (language: ClockLanguage): ClockProblem[] => {
  const problems: ClockProblem[] = [];

  // Add all 12 hours
  for (let hour = 1; hour <= 12; hour++) {
    problems.push(createClockProblem(hour, 0, language));
  }

  return problems;
};

/**
 * Generate clock problems for half past times (lesson 2)
 * :30 for all hours
 */
export const generateHalfPastProblems = (language: ClockLanguage): ClockProblem[] => {
  const problems: ClockProblem[] = [];

  for (let hour = 1; hour <= 12; hour++) {
    problems.push(createClockProblem(hour, 30, language));
  }

  return problems;
};

/**
 * Generate clock problems for quarter past times (lesson 3)
 * :15 for all hours
 */
export const generateQuarterPastProblems = (language: ClockLanguage): ClockProblem[] => {
  const problems: ClockProblem[] = [];

  for (let hour = 1; hour <= 12; hour++) {
    problems.push(createClockProblem(hour, 15, language));
  }

  return problems;
};

/**
 * Generate clock problems for quarter to times (lesson 4)
 * :45 for all hours
 */
export const generateQuarterToProblems = (language: ClockLanguage): ClockProblem[] => {
  const problems: ClockProblem[] = [];

  for (let hour = 1; hour <= 12; hour++) {
    problems.push(createClockProblem(hour, 45, language));
  }

  return problems;
};

/**
 * Generate clock problems for 5-minute intervals (remaining lessons)
 * Lesson 5: :05 and :55 (5 minutes past/to)
 * Lesson 6: :10 and :50 (10 minutes past/to)
 * Lesson 7: :20 and :40 (10 minutes to/past half)
 * Lesson 8: :25 and :35 (5 minutes to/past half)
 */
export const generateFiveMinuteProblems = (minutes: number[], language: ClockLanguage): ClockProblem[] => {
  const problems: ClockProblem[] = [];

  for (const minute of minutes) {
    for (let hour = 1; hour <= 12; hour++) {
      problems.push(createClockProblem(hour, minute, language));
    }
  }

  return problems;
};
