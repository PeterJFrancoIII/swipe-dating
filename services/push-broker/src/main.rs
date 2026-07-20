use dating_push_broker::app;
use dating_push_broker::AppState;
use dating_services_common::listen_addr;
use tracing_subscriber::EnvFilter;

const DEFAULT_PORT: u16 = 8081;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app(AppState::default());
    let addr = listen_addr(DEFAULT_PORT);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("bind push-broker listener");
    tracing::info!("push-broker listening on http://{addr}");
    axum::serve(listener, router)
        .await
        .expect("serve push-broker");
}
