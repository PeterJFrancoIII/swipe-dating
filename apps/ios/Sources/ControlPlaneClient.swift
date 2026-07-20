import Foundation

/// Minimal staging client for local control-plane health checks and presence/discovery.
/// Simulator can reach Mac localhost services started via `make smoke-local` / `make local-services-up`.
actor ControlPlaneClient {
    struct ServiceStatus: Identifiable, Equatable, Sendable {
        let id: String
        let name: String
        let port: Int
        var ok: Bool
        var detail: String
    }

    /// Opaque discovery ticket — no profile capsule / display name (local-first).
    struct DiscoveryTicket: Equatable, Sendable, Identifiable {
        let id: String
        let ticketIdHex: String
        let rendezvousIdHex: String
        let expiresAtUnix: Int64
    }

    struct DiscoverySnapshot: Equatable, Sendable {
        let region: String
        let tickets: [DiscoveryTicket]
        var ticketCount: Int { tickets.count }
        let rawJSON: String
    }

    /// Default local smoke ports (see `scripts/local-smoke.sh`).
    static let defaultServices: [(name: String, port: Int)] = [
        ("rendezvous", 8080),
        ("push-broker", 8081),
        ("turn-credentials", 8082),
        ("sealed-mailbox", 8083),
        ("report-ingest", 8084),
        ("safety-console-api", 8085),
    ]

    private let session: URLSession
    private let host: String
    private let rendezvousPort: Int

    init(host: String = "127.0.0.1", rendezvousPort: Int = 8080, session: URLSession = .shared) {
        self.host = host
        self.rendezvousPort = rendezvousPort
        self.session = session
    }

    func probeHealth(port: Int) async -> (ok: Bool, detail: String) {
        guard let url = URL(string: "http://\(host):\(port)/healthz") else {
            return (false, "bad url")
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = 2
        request.httpMethod = "GET"
        do {
            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                return (false, "non-http response")
            }
            let body = String(data: data, encoding: .utf8) ?? ""
            if (200 ... 299).contains(http.statusCode) {
                return (true, "HTTP \(http.statusCode) \(body.prefix(80))")
            }
            return (false, "HTTP \(http.statusCode)")
        } catch {
            return (false, error.localizedDescription)
        }
    }

    func probeAll() async -> [ServiceStatus] {
        var out: [ServiceStatus] = []
        for svc in Self.defaultServices {
            let result = await probeHealth(port: svc.port)
            out.append(
                ServiceStatus(
                    id: svc.name,
                    name: svc.name,
                    port: svc.port,
                    ok: result.ok,
                    detail: result.detail
                )
            )
        }
        return out
    }

    func putPresence(leaseJSON: String) async throws {
        guard let url = URL(string: "http://\(host):\(rendezvousPort)/v1/presence") else {
            throw URLError(.badURL)
        }
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 5
        request.httpBody = Data(leaseJSON.utf8)
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200 ... 299).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func fetchDiscovery(region: String) async throws -> DiscoverySnapshot {
        var components = URLComponents(string: "http://\(host):\(rendezvousPort)/v1/discovery")!
        components.queryItems = [URLQueryItem(name: "region", value: region)]
        guard let url = components.url else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.timeoutInterval = 5
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200 ... 299).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        let raw = String(data: data, encoding: .utf8) ?? ""
        let tickets = Self.parseTickets(from: data)
        return DiscoverySnapshot(region: region, tickets: tickets, rawJSON: raw)
    }

    /// Extract rendezvous_id hex from a presence lease JSON we just signed.
    static func rendezvousIdHex(fromLeaseJSON json: String) -> String? {
        guard let data = json.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }
        return byteFieldHex(obj["rendezvous_id"])
    }

    private static func parseTickets(from data: Data) -> [DiscoveryTicket] {
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let arr = obj["tickets"] as? [[String: Any]] else {
            return []
        }
        return arr.compactMap { item in
            guard let rendezvous = byteFieldHex(item["rendezvous_id"]),
                  let ticketId = byteFieldHex(item["ticket_id"]) else {
                return nil
            }
            let expires = (item["expires_at"] as? NSNumber)?.int64Value
                ?? (item["expires_at"] as? Int64)
                ?? 0
            return DiscoveryTicket(
                id: rendezvous,
                ticketIdHex: ticketId,
                rendezvousIdHex: rendezvous,
                expiresAtUnix: expires
            )
        }
    }

    private static func byteFieldHex(_ value: Any?) -> String? {
        if let s = value as? String {
            let cleaned = s.replacingOccurrences(of: "0x", with: "")
            return cleaned.isEmpty ? nil : cleaned.lowercased()
        }
        if let nums = value as? [Any] {
            var bytes: [UInt8] = []
            bytes.reserveCapacity(nums.count)
            for n in nums {
                if let i = n as? Int, (0 ... 255).contains(i) {
                    bytes.append(UInt8(i))
                } else if let i = n as? NSNumber {
                    let v = i.intValue
                    guard (0 ... 255).contains(v) else { return nil }
                    bytes.append(UInt8(v))
                } else {
                    return nil
                }
            }
            return bytes.map { String(format: "%02x", $0) }.joined()
        }
        return nil
    }
}
