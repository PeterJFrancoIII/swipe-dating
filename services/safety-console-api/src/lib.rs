//! Safety console API stub — lists empty cases.

use axum::{routing::get, Json, Router};
use dating_services_common::health_router;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SafetyCase {
    pub case_id: String,
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct CasesResponse {
    pub cases: Vec<SafetyCase>,
}

pub fn app() -> Router {
    health_router().merge(Router::new().route("/v1/cases", get(list_cases)))
}

async fn list_cases() -> Json<CasesResponse> {
    Json(CasesResponse { cases: vec![] })
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn cases_empty_list() {
        let app = app();
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/v1/cases")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
