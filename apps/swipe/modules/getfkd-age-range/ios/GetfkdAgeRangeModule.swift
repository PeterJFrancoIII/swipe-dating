import ExpoModulesCore
import UIKit

#if canImport(DeclaredAgeRange)
import DeclaredAgeRange
#endif

public class GetfkdAgeRangeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GetfkdAgeRange")

    AsyncFunction("requestAdultRange") { () -> [String: Any] in
      #if canImport(DeclaredAgeRange)
      if #available(iOS 26.0, *) {
        return await requestDeclaredAdultRange()
      }
      #endif
      return ["shared": false, "reason": "apple_age_unavailable"]
    }
  }
}

#if canImport(DeclaredAgeRange)
@available(iOS 26.0, *)
@MainActor
private func requestDeclaredAdultRange() async -> [String: Any] {
  guard let host = presentingViewController() else {
    return ["shared": false, "reason": "apple_age_unavailable"]
  }
  do {
    let response = try await AgeRangeService.shared.requestAgeRange(ageGates: 18, in: host)
    switch response {
    case .sharing(let range):
      let lower = range.lowerBound ?? 0
      return ["shared": true, "lowerBound": lower]
    case .declinedSharing:
      return ["shared": false, "reason": "apple_age_declined"]
    @unknown default:
      return ["shared": false, "reason": "apple_age_unavailable"]
    }
  } catch {
    return ["shared": false, "reason": "apple_age_unavailable"]
  }
}
#endif

@MainActor
private func presentingViewController() -> UIViewController? {
  let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
  let window = scenes.flatMap(\.windows).first(where: \.isKeyWindow) ?? scenes.first?.windows.first
  var controller = window?.rootViewController
  while let presented = controller?.presentedViewController {
    controller = presented
  }
  return controller
}
