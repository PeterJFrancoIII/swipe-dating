use dating_safety_console_api::app;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8085")
        .await
        .expect("bind safety-console-api listener");
    tracing::info!("safety-console-api listening on http://127.0.0.1:8085");
    axum::serve(listener, router)
        .await
        .expect("serve safety-console-api");
}
