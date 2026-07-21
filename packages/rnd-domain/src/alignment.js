/**
 * @typedef {{ answerId: string, importance?: number, dealbreaker?: boolean, visibility?: "profile" | "score_only" | "private_unused" }} AlignmentAnswer
 * @typedef {{ questionnaireId: string, answers: Record<string, AlignmentAnswer> }} AlignmentProfile
 */

/**
 * Reciprocal, local-first score. The lower importance weight wins so one person
 * cannot unilaterally inflate a question. A dealbreaker on either side excludes.
 * @param {AlignmentProfile} left
 * @param {AlignmentProfile} right
 */
export function scoreAlignment(left, right) {
  if (left.questionnaireId !== right.questionnaireId) {
    throw new Error("questionnaire versions differ");
  }

  let comparableQuestions = 0;
  let matchedWeight = 0;
  let possibleWeight = 0;
  const matches = [];
  const differences = [];

  for (const [questionId, leftAnswer] of Object.entries(left.answers)) {
    const rightAnswer = right.answers[questionId];
    if (!rightAnswer) continue;
    validateAnswer(leftAnswer);
    validateAnswer(rightAnswer);
    if (!isComparable(leftAnswer) || !isComparable(rightAnswer)) continue;

    const weight = Math.min(leftAnswer.importance ?? 3, rightAnswer.importance ?? 3);
    if (weight === 0) continue;

    comparableQuestions += 1;
    possibleWeight += weight;
    if (leftAnswer.answerId === rightAnswer.answerId) {
      matchedWeight += weight;
      matches.push({ questionId, weight });
    } else {
      differences.push({ questionId, weight });
      if (leftAnswer.dealbreaker || rightAnswer.dealbreaker) {
        return result({
          comparableQuestions,
          matchedWeight,
          possibleWeight,
          dealbreakerConflict: true,
          matches,
          differences,
        });
      }
    }
  }

  return result({
    comparableQuestions,
    matchedWeight,
    possibleWeight,
    dealbreakerConflict: false,
    matches,
    differences,
  });
}

function result({
  comparableQuestions,
  matchedWeight,
  possibleWeight,
  dealbreakerConflict,
  matches,
  differences,
}) {
  const scorePercent =
    dealbreakerConflict || possibleWeight === 0
      ? 0
      : Math.min(100, Math.round((matchedWeight * 100) / possibleWeight));
  const top = (values) =>
    values
      .toSorted((a, b) => b.weight - a.weight || a.questionId.localeCompare(b.questionId))
      .slice(0, 3)
      .map(({ questionId }) => questionId);

  return Object.freeze({
    scorePercent,
    comparableQuestions,
    matchedWeight,
    possibleWeight,
    dealbreakerConflict,
    strongestMatches: Object.freeze(top(matches)),
    strongestDifferences: Object.freeze(top(differences)),
  });
}

function validateAnswer(answer) {
  const importance = answer.importance ?? 3;
  if (!Number.isInteger(importance) || importance < 0 || importance > 5) {
    throw new RangeError("importance must be an integer from 0 through 5");
  }
}

function isComparable(answer) {
  return (
    answer.visibility !== "private_unused" &&
    Boolean(answer.answerId) &&
    answer.answerId !== "prefer_not"
  );
}
