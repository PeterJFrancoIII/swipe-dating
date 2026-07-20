//! Push broker stub — registers hashed push tokens only.

use axum::{extract::State, routing::post, Json, Router};
use dating_services_common::{health_router, AppError, MAX_JSON_BODY_BYTES};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Clone, Default)]
pub struct AppState {
    tokens: Arc<Mutex<Vec<String>>>,
}

#[derive(Debug, Deserialize)]
pub struct RegisterPushRequest {
    pub token_hash: String,
}

#[derive(Debug, Serialize)]
pub struct RegisterPushResponse {
    pub registered: bool,
}

pub fn app(state: AppState) -> Router {
    health_router()
        .merge(
            Router::new()
                .route("/v1/push/register", post(register_push))
                .with_state(state),
        )
        .layer(axum::extract::DefaultBodyLimit::max(MAX_JSON_BODY_BYTES))
}

async fn register_push(
    State(state): State<AppState>,
    Json(req): Json<RegisterPushRequest>,
) -> Result<Json<RegisterPushResponse>, AppError> {
    if req.token_hash.is_empty() || req.token_hash.len() > 128 {
        return Err(AppError::BadRequest);
    }
    let mut tokens = state.tokens.lock().map_err(|_| AppError::Internal)?;
    tokens.push(req.token_hash);
    Ok(Json(RegisterPushResponse { registered: true }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn register_push_token_hash() {
        let app = app(AppState::default());
        let body = serde_json::json!({"token_hash": "abc123hash"});
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/v1/push/register")
                    .header("content-type", "application/json")
                    .body(Body::from(body.to_string()))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
