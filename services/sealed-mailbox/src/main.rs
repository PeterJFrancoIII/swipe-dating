use dating_sealed_mailbox::{app, MailboxConfig};
use dating_services_common::listen_addr;
use tracing_subscriber::EnvFilter;

const DEFAULT_PORT: u16 = 8083;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let router = app(MailboxConfig::default());
    let addr = listen_addr(DEFAULT_PORT);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("bind sealed-mailbox listener");
    tracing::info!("sealed-mailbox listening on http://{addr}");
    axum::serve(listener, router)
        .await
        .expect("serve sealed-mailbox");
}
