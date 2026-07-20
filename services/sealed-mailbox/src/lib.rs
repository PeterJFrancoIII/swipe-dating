//! Sealed mailbox stub — disabled by default (503).

use axum::{routing::post, Json, Router};
use dating_services_common::{health_router, AppError, MAX_JSON_BODY_BYTES};
use serde::Serialize;

#[derive(Debug, Clone, Copy, Default)]
pub struct MailboxConfig {
    pub enabled: bool,
}

#[derive(Debug, Serialize)]
pub struct DisabledResponse {
    pub enabled: bool,
    pub message: &'static str,
}

pub fn app(config: MailboxConfig) -> Router {
    let enabled = config.enabled;
    health_router()
        .merge(Router::new().route(
            "/v1/mailbox/enqueue",
            post(move || async move {
                if enabled {
                    Ok(Json(DisabledResponse {
                        enabled: true,
                        message: "mailbox stub accepts ciphertext only",
                    }))
                } else {
                    Err(AppError::ServiceUnavailable)
                }
            }),
        ))
        .layer(axum::extract::DefaultBodyLimit::max(MAX_JSON_BODY_BYTES))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn mailbox_disabled_by_default() {
        let app = app(MailboxConfig::default());
        let response = app
            .oneshot(
                Request::builder()
                    .method("POST")
                    .uri("/v1/mailbox/enqueue")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
    }
}
