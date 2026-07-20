use dating_push_broker::app;
use dating_push_broker::AppState;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app(AppState::default());
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8081")
        .await
        .expect("bind push-broker listener");
    tracing::info!("push-broker listening on http://127.0.0.1:8081");
    axum::serve(listener, router)
        .await
        .expect("serve push-broker");
}
