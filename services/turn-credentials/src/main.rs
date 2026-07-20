use dating_turn_credentials::app;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8082")
        .await
        .expect("bind turn-credentials listener");
    tracing::info!("turn-credentials listening on http://127.0.0.1:8082");
    axum::serve(listener, router)
        .await
        .expect("serve turn-credentials");
}
