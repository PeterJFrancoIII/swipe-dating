//! Deterministic, local-first compatibility scoring.
//!
//! Raw questionnaire answers are expected to remain encrypted on the device.
//! This module does not perform networking, telemetry, advertising, or popularity ranking.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;

pub const MAX_IMPORTANCE: u8 = 5;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AnswerVisibility {
    Profile,
    ScoreOnly,
    PrivateUnused,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AlignmentAnswer {
    pub question_id: String,
    pub answer_id: String,
    pub importance: u8,
    pub dealbreaker: bool,
    pub visibility: AnswerVisibility,
}

impl AlignmentAnswer {
    pub fn comparable(&self) -> bool {
        self.visibility != AnswerVisibility::PrivateUnused
            && self.answer_id != "prefer_not"
            && !self.answer_id.is_empty()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AlignmentProfile {
    pub questionnaire_id: String,
    pub answers: Vec<AlignmentAnswer>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct AlignmentResult {
    pub score_percent: u8,
    pub comparable_questions: u32,
    pub matched_weight: u32,
    pub possible_weight: u32,
    pub dealbreaker_conflict: bool,
}

impl AlignmentResult {
    fn empty() -> Self {
        Self {
            score_percent: 0,
            comparable_questions: 0,
            matched_weight: 0,
            possible_weight: 0,
            dealbreaker_conflict: false,
        }
    }
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum AlignmentError {
    #[error("questionnaire versions differ")]
    QuestionnaireMismatch,
    #[error("importance must be between 0 and 5")]
    InvalidImportance,
    #[error("question id must be non-empty")]
    EmptyQuestionId,
    #[error("duplicate question id: {0}")]
    DuplicateQuestion(String),
}

fn index_answers(
    answers: &[AlignmentAnswer],
) -> Result<BTreeMap<&str, &AlignmentAnswer>, AlignmentError> {
    let mut indexed = BTreeMap::new();
    for answer in answers {
        if answer.question_id.is_empty() {
            return Err(AlignmentError::EmptyQuestionId);
        }
        if answer.importance > MAX_IMPORTANCE {
            return Err(AlignmentError::InvalidImportance);
        }
        if indexed
            .insert(answer.question_id.as_str(), answer)
            .is_some()
        {
            return Err(AlignmentError::DuplicateQuestion(
                answer.question_id.clone(),
            ));
        }
    }
    Ok(indexed)
}

/// Score two answer sets locally.
///
/// The reciprocal question weight is the lower of the two importance values. This prevents
/// one user from unilaterally inflating a question's contribution. A mismatched answer marked
/// as a dealbreaker by either user returns a zero score with `dealbreaker_conflict = true`.
pub fn score_alignment(
    left: &AlignmentProfile,
    right: &AlignmentProfile,
) -> Result<AlignmentResult, AlignmentError> {
    if left.questionnaire_id != right.questionnaire_id {
        return Err(AlignmentError::QuestionnaireMismatch);
    }

    let left_answers = index_answers(&left.answers)?;
    let right_answers = index_answers(&right.answers)?;
    let mut result = AlignmentResult::empty();

    for (question_id, left_answer) in left_answers {
        let Some(right_answer) = right_answers.get(question_id) else {
            continue;
        };
        if !left_answer.comparable() || !right_answer.comparable() {
            continue;
        }

        let weight = u32::from(left_answer.importance.min(right_answer.importance));
        if weight == 0 {
            continue;
        }

        result.comparable_questions += 1;
        result.possible_weight += weight;

        if left_answer.answer_id == right_answer.answer_id {
            result.matched_weight += weight;
        } else if left_answer.dealbreaker || right_answer.dealbreaker {
            return Ok(AlignmentResult {
                score_percent: 0,
                dealbreaker_conflict: true,
                ..result
            });
        }
    }

    let rounded_numerator = result
        .matched_weight
        .saturating_mul(100)
        .saturating_add(result.possible_weight / 2);
    if let Some(rounded) = rounded_numerator.checked_div(result.possible_weight) {
        result.score_percent = rounded.min(100) as u8;
    }

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn answer(question: &str, value: &str, importance: u8, dealbreaker: bool) -> AlignmentAnswer {
        AlignmentAnswer {
            question_id: question.to_string(),
            answer_id: value.to_string(),
            importance,
            dealbreaker,
            visibility: AnswerVisibility::ScoreOnly,
        }
    }

    fn profile(answers: Vec<AlignmentAnswer>) -> AlignmentProfile {
        AlignmentProfile {
            questionnaire_id: "alignment-us-en-v1".to_string(),
            answers,
        }
    }

    #[test]
    fn exact_answers_score_one_hundred() {
        let left = profile(vec![answer("values", "health", 5, false)]);
        let right = profile(vec![answer("values", "health", 4, false)]);
        let result = score_alignment(&left, &right).unwrap();
        assert_eq!(result.score_percent, 100);
        assert_eq!(result.matched_weight, 4);
        assert_eq!(result.possible_weight, 4);
        assert!(!result.dealbreaker_conflict);
    }

    #[test]
    fn reciprocal_weight_prevents_unilateral_inflation() {
        let left = profile(vec![
            answer("values", "health", 5, false),
            answer("social", "quiet", 5, false),
        ]);
        let right = profile(vec![
            answer("values", "health", 1, false),
            answer("social", "nightlife", 5, false),
        ]);
        let result = score_alignment(&left, &right).unwrap();
        assert_eq!(result.matched_weight, 1);
        assert_eq!(result.possible_weight, 6);
        assert_eq!(result.score_percent, 17);
    }

    #[test]
    fn dealbreaker_conflict_excludes_candidate() {
        let left = profile(vec![answer("structure", "monogamy", 5, true)]);
        let right = profile(vec![answer("structure", "polyamory", 5, false)]);
        let result = score_alignment(&left, &right).unwrap();
        assert!(result.dealbreaker_conflict);
        assert_eq!(result.score_percent, 0);
    }

    #[test]
    fn private_unused_and_prefer_not_are_not_compared() {
        let mut hidden = answer("politics", "a", 5, true);
        hidden.visibility = AnswerVisibility::PrivateUnused;
        let left = profile(vec![hidden, answer("intimacy", "prefer_not", 5, true)]);
        let right = profile(vec![
            answer("politics", "b", 5, true),
            answer("intimacy", "other", 5, true),
        ]);
        let result = score_alignment(&left, &right).unwrap();
        assert_eq!(result.comparable_questions, 0);
        assert!(!result.dealbreaker_conflict);
    }

    #[test]
    fn rejects_invalid_importance_and_duplicate_questions() {
        let invalid = profile(vec![answer("values", "health", 6, false)]);
        assert_eq!(
            score_alignment(&invalid, &profile(vec![])),
            Err(AlignmentError::InvalidImportance)
        );

        let duplicate = profile(vec![
            answer("values", "health", 1, false),
            answer("values", "money", 1, false),
        ]);
        assert_eq!(
            score_alignment(&duplicate, &profile(vec![])),
            Err(AlignmentError::DuplicateQuestion("values".to_string()))
        );
    }

    #[test]
    fn rejects_questionnaire_version_mismatch() {
        let left = profile(vec![]);
        let mut right = profile(vec![]);
        right.questionnaire_id = "future-version".to_string();
        assert_eq!(
            score_alignment(&left, &right),
            Err(AlignmentError::QuestionnaireMismatch)
        );
    }
}
