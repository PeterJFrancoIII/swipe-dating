use dating_rendezvous::app;
use dating_rendezvous::AppState;
use dating_services_common::listen_addr;
use tracing_subscriber::EnvFilter;

const DEFAULT_PORT: u16 = 8080;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let state = AppState::new();
    let router = app(state);
    let addr = listen_addr(DEFAULT_PORT);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("bind rendezvous listener");
    tracing::info!("rendezvous listening on http://{addr}");
    axum::serve(listener, router)
        .await
        .expect("serve rendezvous");
}
