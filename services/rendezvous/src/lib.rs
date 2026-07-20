//! Rendezvous control-plane service (ephemeral presence).

use axum::{
    extract::{Query, State},
    http::StatusCode,
    routing::{get, post, put},
    Json, Router,
};
use dating_crypto::{hash_blake3, SigningKeypair};
use dating_protocol::{
    fetch_ticket_signing_payload, validate_fetch_ticket, validate_presence_lease, FetchTicket,
    PresenceLease, PROTOCOL_VERSION,
};
use dating_services_common::{health_router, AppError, MAX_JSON_BODY_BYTES};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone)]
pub struct AppState {
    inner: Arc<Mutex<ServerInner>>,
}

struct ServerInner {
    presence: HashMap<[u8; 32], PresenceLease>,
    tickets: HashMap<[u8; 32], FetchTicket>,
    server_kp: SigningKeypair,
}

impl Default for AppState {
    fn default() -> Self {
        let mut rng = dating_test_support::FakeRng::new(0xDEAD_BEEF_CAFE);
        let server_kp = SigningKeypair::generate(&mut rng);
        Self {
            inner: Arc::new(Mutex::new(ServerInner {
                presence: HashMap::new(),
                tickets: HashMap::new(),
                server_kp,
            })),
        }
    }
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }

    fn now_unix() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs() as i64)
            .unwrap_or(0)
    }
}

#[derive(Debug, Deserialize)]
pub struct DiscoveryQuery {
    pub region: String,
}

#[derive(Debug, Serialize)]
pub struct DiscoveryResponse {
    pub tickets: Vec<FetchTicket>,
}

#[derive(Debug, Deserialize)]
pub struct FetchTicketRequest {
    pub rendezvous_id: [u8; 32],
    pub requester_public_key: [u8; 32],
}

#[derive(Debug, Serialize)]
pub struct FetchTicketResponse {
    pub ticket: FetchTicket,
}

pub fn app(state: AppState) -> Router {
    health_router()
        .merge(
            Router::new()
                .route("/v1/presence", put(put_presence))
                .route("/v1/discovery", get(get_discovery))
                .route("/v1/fetch-tickets", post(post_fetch_ticket))
                .with_state(state),
        )
        .layer(axum::extract::DefaultBodyLimit::max(MAX_JSON_BODY_BYTES))
}

async fn put_presence(
    State(state): State<AppState>,
    Json(lease): Json<PresenceLease>,
) -> Result<StatusCode, AppError> {
    let clock = dating_test_support::TestClock::new(AppState::now_unix());
    validate_presence_lease(&lease, &clock).map_err(|_| AppError::BadRequest)?;

    let mut inner = state.inner.lock().map_err(|_| AppError::Internal)?;
    inner.presence.insert(lease.rendezvous_id, lease);
    Ok(StatusCode::NO_CONTENT)
}

async fn get_discovery(
    State(state): State<AppState>,
    Query(query): Query<DiscoveryQuery>,
) -> Result<Json<DiscoveryResponse>, AppError> {
    let now = AppState::now_unix();
    let mut inner = state.inner.lock().map_err(|_| AppError::Internal)?;
    inner.presence.retain(|_, lease| lease.expires_at > now);

    let mut candidates: Vec<FetchTicket> = inner
        .presence
        .values()
        .filter(|lease| lease.coarse_region == query.region)
        .map(|lease| issue_ephemeral_ticket(lease, now, &inner.server_kp))
        .collect();

    // Randomize order (bounded set, no attractiveness ranking).
    candidates.sort_by_key(|t| t.ticket_id);

    let max = 20usize;
    candidates.truncate(max);

    Ok(Json(DiscoveryResponse {
        tickets: candidates,
    }))
}

fn issue_ephemeral_ticket(
    lease: &PresenceLease,
    now: i64,
    server_kp: &SigningKeypair,
) -> FetchTicket {
    let ticket_id = hash_blake3(&[lease.rendezvous_id.as_slice(), &now.to_le_bytes()].concat());
    let expires_at = (now + 300).min(lease.expires_at);
    let mut ticket = FetchTicket {
        protocol_version: PROTOCOL_VERSION,
        ticket_id,
        rendezvous_id: lease.rendezvous_id,
        issued_at: now,
        expires_at,
        nonce: lease.nonce,
        signature: [0; 64],
        signer_public_key: server_kp.public_key_bytes(),
    };
    let payload = fetch_ticket_signing_payload(&ticket);
    ticket.signature = server_kp.sign(&payload).0;
    ticket
}

async fn post_fetch_ticket(
    State(state): State<AppState>,
    Json(req): Json<FetchTicketRequest>,
) -> Result<Json<FetchTicketResponse>, AppError> {
    let now = AppState::now_unix();
    let mut inner = state.inner.lock().map_err(|_| AppError::Internal)?;

    let Some(lease) = inner.presence.get(&req.rendezvous_id).cloned() else {
        return Err(AppError::NotFound);
    };

    if lease.expires_at <= now {
        return Err(AppError::NotFound);
    }

    let ticket_id = hash_blake3(
        &[
            req.rendezvous_id.as_slice(),
            req.requester_public_key.as_slice(),
            &now.to_le_bytes(),
        ]
        .concat(),
    );
    let expires_at = now + 300;
    let mut ticket = FetchTicket {
        protocol_version: PROTOCOL_VERSION,
        ticket_id,
        rendezvous_id: req.rendezvous_id,
        issued_at: now,
        expires_at,
        nonce: lease.nonce,
        signature: [0; 64],
        signer_public_key: inner.server_kp.public_key_bytes(),
    };
    let payload = fetch_ticket_signing_payload(&ticket);
    ticket.signature = inner.server_kp.sign(&payload).0;

    let clock = dating_test_support::TestClock::new(now);
    validate_fetch_ticket(&ticket, &clock).map_err(|_| AppError::Internal)?;

    inner.tickets.insert(ticket_id, ticket.clone());

    Ok(Json(FetchTicketResponse { ticket }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use dating_protocol::presence_signing_payload;
    use dating_test_support::FakeRng;
    use tower::ServiceExt;

    fn sample_lease(now: i64) -> PresenceLease {
        let mut rng = FakeRng::new(7);
        let kp = SigningKeypair::generate(&mut rng);
        let rendezvous_id = hash_blake3(b"rendezvous-test");
        let expires_at = now + 60;
        let payload = presence_signing_payload(
            PROTOCOL_VERSION,
            &rendezvous_id,
            1,
            "us-west-coarse",
            now,
            expires_at,
            &[0xCD; 16],
        );
        let sig = kp.sign(&payload);
        PresenceLease {
            protocol_version: PROTOCOL_VERSION,
            rendezvous_id,
            capability_bitmap: 1,
            coarse_region: "us-west-coarse".to_string(),
            issued_at: now,
            expires_at,
            nonce: [0xCD; 16],
            signature: sig.0,
            signer_public_key: kp.public_key_bytes(),
        }
    }

    #[tokio::test]
    async fn presence_put_and_discovery() {
        let state = AppState::new();
        let app = app(state);
        let now = AppState::now_unix();
        let lease = sample_lease(now);
        let body = serde_json::to_vec(&lease).unwrap();

        let put = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("PUT")
                    .uri("/v1/presence")
                    .header("content-type", "application/json")
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(put.status(), StatusCode::NO_CONTENT);

        let discovery = app
            .oneshot(
                Request::builder()
                    .uri("/v1/discovery?region=us-west-coarse")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(discovery.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn healthz_ok() {
        let app = app(AppState::new());
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

    /// In-process load smoke: N concurrent discovery requests (no Docker).
    #[tokio::test]
    async fn concurrent_discovery_load_smoke() {
        const CONCURRENCY: usize = 32;
        let state = AppState::new();
        let app = app(state);
        let now = AppState::now_unix();
        let lease = sample_lease(now);
        let body = serde_json::to_vec(&lease).unwrap();

        let put = app
            .clone()
            .oneshot(
                Request::builder()
                    .method("PUT")
                    .uri("/v1/presence")
                    .header("content-type", "application/json")
                    .body(Body::from(body))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(put.status(), StatusCode::NO_CONTENT);

        let mut handles = Vec::with_capacity(CONCURRENCY);
        for _ in 0..CONCURRENCY {
            let app = app.clone();
            handles.push(tokio::spawn(async move {
                app.oneshot(
                    Request::builder()
                        .uri("/v1/discovery?region=us-west-coarse")
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap()
            }));
        }

        for handle in handles {
            let response = handle.await.unwrap();
            assert_eq!(response.status(), StatusCode::OK);
        }
    }
}
