use dating_safety_console_api::app;
use dating_services_common::listen_addr;
use tracing_subscriber::EnvFilter;

const DEFAULT_PORT: u16 = 8085;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app();
    let addr = listen_addr(DEFAULT_PORT);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("bind safety-console-api listener");
    tracing::info!("safety-console-api listening on http://{addr}");
    axum::serve(listener, router)
        .await
        .expect("serve safety-console-api");
}
