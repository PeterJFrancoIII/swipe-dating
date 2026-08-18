import CoreLocation
import ExpoModulesCore

public class GetfkdLocationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GetfkdLocation")

    Events("onPeerSignal")

    AsyncFunction("requestReducedFix") { () -> [String: Any] in
      try await LocationAttestor.shared.requestReducedFix()
    }

    AsyncFunction("startProximityBroadcast") { () -> Bool in
      ProximityRadioBox.shared.start { [weak self] rssi in
        self?.sendEvent("onPeerSignal", ["rssi": rssi])
      }
      return true
    }

    AsyncFunction("stopProximityBroadcast") {
      ProximityRadioBox.shared.stop()
    }

    AsyncFunction("playProximityCue") { (closeness: Double) in
      ProximityRadioBox.shared.playCue(closeness: closeness)
    }
  }
}

private enum LocationAttestorError: LocalizedError {
  case denied
  case unavailable

  var errorDescription: String? {
    switch self {
    case .denied:
      return "location_denied"
    case .unavailable:
      return "location_unauthentic"
    }
  }
}

private final class LocationAttestor: NSObject, CLLocationManagerDelegate, @unchecked Sendable {
  static let shared = LocationAttestor()

  private let manager = CLLocationManager()
  private let lock = NSLock()
  private var pending: CheckedContinuation<[String: Any], Error>?

  override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyReduced
  }

  func requestReducedFix() async throws -> [String: Any] {
    try await withCheckedThrowingContinuation { continuation in
      lock.lock()
      if pending != nil {
        lock.unlock()
        continuation.resume(throwing: LocationAttestorError.unavailable)
        return
      }
      pending = continuation
      lock.unlock()
      DispatchQueue.main.async {
        self.start()
      }
    }
  }

  private func start() {
    switch manager.authorizationStatus {
    case .notDetermined:
      manager.requestWhenInUseAuthorization()
    case .authorizedWhenInUse, .authorizedAlways:
      manager.requestLocation()
    default:
      finish(error: LocationAttestorError.denied)
    }
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    switch manager.authorizationStatus {
    case .authorizedWhenInUse, .authorizedAlways:
      manager.requestLocation()
    case .notDetermined:
      break
    default:
      finish(error: LocationAttestorError.denied)
    }
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else {
      finish(error: LocationAttestorError.unavailable)
      return
    }
    var simulated = false
    var accessory = false
    if #available(iOS 15.0, *), let source = location.sourceInformation {
      simulated = source.isSimulatedBySoftware
      accessory = source.isProducedByAccessory
    }
    let reduced: Bool
    if #available(iOS 14.0, *) {
      reduced = manager.accuracyAuthorization != .fullAccuracy
    } else {
      reduced = true
    }
    finish(
      value: [
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "accuracy_m": location.horizontalAccuracy,
        "timestamp_ms": Int(location.timestamp.timeIntervalSince1970 * 1000),
        "simulated": simulated,
        "mock": accessory,
        "reduced_accuracy": reduced,
      ]
    )
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    finish(error: error)
  }

  private func finish(value: [String: Any]? = nil, error: Error? = nil) {
    lock.lock()
    let continuation = pending
    pending = nil
    lock.unlock()
    if let error {
      continuation?.resume(throwing: error)
    } else if let value {
      continuation?.resume(returning: value)
    } else {
      continuation?.resume(throwing: LocationAttestorError.unavailable)
    }
  }
}
