use dating_rendezvous::app;
use dating_rendezvous::AppState;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let state = AppState::new();
    let router = app(state);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8080")
        .await
        .expect("bind rendezvous listener");
    tracing::info!("rendezvous listening on http://127.0.0.1:8080");
    axum::serve(listener, router)
        .await
        .expect("serve rendezvous");
}
