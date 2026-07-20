//! TURN credentials stub — returns labeled MOCK ephemeral credentials.

use axum::{routing::post, Json, Router};
use dating_services_common::{health_router, MAX_JSON_BODY_BYTES};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct TurnCredentialsResponse {
    pub username: String,
    pub credential: String,
    pub ttl_seconds: u32,
    pub uris: Vec<String>,
    pub label: &'static str,
}

pub fn app() -> Router {
    health_router()
        .merge(Router::new().route("/v1/turn-credentials", post(turn_credentials)))
        .layer(axum::extract::DefaultBodyLimit::max(MAX_JSON_BODY_BYTES))
}

async fn turn_credentials() -> Json<TurnCredentialsResponse> {
    Json(TurnCredentialsResponse {
        username: "MOCK:user:1700000000".to_string(),
        credential: "MOCK:credential:placeholder".to_string(),
        ttl_seconds: 600,
        uris: vec!["turn:turn.example.com:3478?transport=udp".to_string()],
        label: "MOCK",
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn turn_credentials_mock() {
        let app = app();
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/v1/turn-credentials")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
