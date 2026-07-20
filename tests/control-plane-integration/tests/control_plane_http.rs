//! In-process control-plane HTTP smoke tests (no Docker).

use axum::body::Body;
use axum::http::{Request, StatusCode};
use axum::Router;
use dating_rendezvous::{app as rendezvous_app, AppState as RendezvousState};
use dating_report_ingest::app as report_app;
use dating_sealed_mailbox::{app as mailbox_app, MailboxConfig};
use http_body_util::BodyExt;
use tower::ServiceExt;

fn combined_app() -> Router {
    Router::new()
        .nest("/rendezvous", rendezvous_app(RendezvousState::new()))
        .nest("/report", report_app())
        .nest("/mailbox", mailbox_app(MailboxConfig::default()))
}

#[tokio::test]
async fn healthz_on_all_merged_services() {
    let app = combined_app();
    for path in ["/rendezvous/healthz", "/report/healthz", "/mailbox/healthz"] {
        let response = app
            .clone()
            .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK, "path {path}");
    }
}

#[tokio::test]
async fn report_ingest_accepts_metadata() {
    let app = combined_app();
    let body = serde_json::json!({
        "category": "harassment",
        "evidence_hashes": ["ab".repeat(32)]
    });
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/report/v1/reports")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["accepted"], true);
}

#[tokio::test]
async fn sealed_mailbox_disabled_returns_503() {
    let app = combined_app();
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/mailbox/v1/mailbox/enqueue")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn rendezvous_discovery_empty_region() {
    let app = combined_app();
    let response = app
        .oneshot(
            Request::builder()
                .uri("/rendezvous/v1/discovery?region=us-west-coarse")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert!(json["tickets"].as_array().unwrap().is_empty());
}
