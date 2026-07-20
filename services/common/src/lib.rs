//! Shared service utilities.

use axum::{http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use serde::Serialize;
use thiserror::Error;

/// Maximum request body size for control-plane APIs (1 MiB).
pub const MAX_REQUEST_BODY_BYTES: usize = 1_048_576;

/// Default JSON payload limit for small metadata endpoints.
pub const MAX_JSON_BODY_BYTES: usize = 65_536;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("bad request")]
    BadRequest,
    #[error("not found")]
    NotFound,
    #[error("service unavailable")]
    ServiceUnavailable,
    #[error("internal error")]
    Internal,
}

#[derive(Debug, Serialize)]
pub struct ErrorBody {
    pub error: &'static str,
    pub code: &'static str,
}

impl AppError {
    fn status_and_code(&self) -> (StatusCode, &'static str) {
        match self {
            Self::BadRequest => (StatusCode::BAD_REQUEST, "bad_request"),
            Self::NotFound => (StatusCode::NOT_FOUND, "not_found"),
            Self::ServiceUnavailable => (StatusCode::SERVICE_UNAVAILABLE, "service_unavailable"),
            Self::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, code) = self.status_and_code();
        let body = ErrorBody { error: code, code };
        (status, Json(body)).into_response()
    }
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: &'static str,
}

pub fn health_router() -> Router {
    Router::new().route(
        "/healthz",
        get(|| async { Json(HealthResponse { status: "ok" }) }),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn healthz_returns_ok() {
        let app = health_router();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/healthz")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
