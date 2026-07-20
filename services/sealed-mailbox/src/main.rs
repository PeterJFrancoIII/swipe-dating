use dating_sealed_mailbox::{app, MailboxConfig};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app(MailboxConfig::default());
    let listener = tokio::net::TcpListener::bind("127.0.0.1:8083")
        .await
        .expect("bind sealed-mailbox listener");
    tracing::info!("sealed-mailbox listening on http://127.0.0.1:8083");
    axum::serve(listener, router)
        .await
        .expect("serve sealed-mailbox");
}
