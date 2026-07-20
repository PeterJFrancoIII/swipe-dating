//! Report ingest stub — metadata and evidence hashes only.

use axum::{routing::post, Json, Router};
use dating_services_common::{health_router, AppError, MAX_JSON_BODY_BYTES};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct ReportIngestRequest {
    pub category: String,
    pub evidence_hashes: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ReportIngestResponse {
    pub accepted: bool,
    pub evidence_count: usize,
}

pub fn app() -> Router {
    health_router()
        .merge(Router::new().route("/v1/reports", post(ingest_report)))
        .layer(axum::extract::DefaultBodyLimit::max(MAX_JSON_BODY_BYTES))
}

async fn ingest_report(
    Json(req): Json<ReportIngestRequest>,
) -> Result<Json<ReportIngestResponse>, AppError> {
    if req.category.is_empty() || req.evidence_hashes.is_empty() {
        return Err(AppError::BadRequest);
    }
    if req.evidence_hashes.len() > 32 {
        return Err(AppError::BadRequest);
    }
    for hash in &req.evidence_hashes {
        if hash.len() != 64 || !hash.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(AppError::BadRequest);
        }
    }
    Ok(Json(ReportIngestResponse {
        accepted: true,
        evidence_count: req.evidence_hashes.len(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn ingest_metadata_only_report() {
        let app = app();
        let body = serde_json::json!({
            "category": "spam",
            "evidence_hashes": ["ab".repeat(32)]
        });
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/v1/reports")
                    .header("content-type", "application/json")
                    .body(Body::from(body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
