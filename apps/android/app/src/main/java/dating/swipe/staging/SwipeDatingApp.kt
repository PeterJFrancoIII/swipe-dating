package dating.swipe.staging

import android.app.Application

class SwipeDatingApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // UniFFI Rust core init pending — no crypto here.
    }
}
