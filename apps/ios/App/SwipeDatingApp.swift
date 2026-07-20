import SwiftUI

@main
struct SwipeDatingApp: App {
    @StateObject private var model = AppModel()

    var body: some Scene {
        WindowGroup {
            RootFlowView()
                .environmentObject(model)
                .preferredColorScheme(.light)
        }
    }
}
