use dating_services_common::listen_addr;
use dating_turn_credentials::app;
use tracing_subscriber::EnvFilter;

const DEFAULT_PORT: u16 = 8082;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app();
    let addr = listen_addr(DEFAULT_PORT);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("bind turn-credentials listener");
    tracing::info!("turn-credentials listening on http://{addr}");
    axum::serve(listener, router)
        .await
        .expect("serve turn-credentials");
}
