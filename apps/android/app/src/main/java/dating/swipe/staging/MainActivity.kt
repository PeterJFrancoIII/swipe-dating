package dating.swipe.staging

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import dating.swipe.core.DatingCoreBridge
import java.util.Calendar

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StagingTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    StagingScreen()
                }
            }
        }
    }
}

@Composable
fun StagingScreen() {
    var birthYear by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "STAGING — Swipe Dating",
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = "Protocol v${DatingCoreBridge.protocolVersion()}",
                style = MaterialTheme.typography.bodyMedium,
            )
            if (DatingCoreBridge.isStagingFallback) {
                Text(
                    text = "Core: ${DatingCoreBridge.STAGING_FALLBACK_LABEL} (JNI lib not loaded)",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
            Text(
                text = "Age gate (18+)",
                style = MaterialTheme.typography.titleSmall,
            )
            OutlinedTextField(
                value = birthYear,
                onValueChange = { birthYear = it },
                label = { Text("Birth year") },
                singleLine = true,
            )
            Button(onClick = {
                statusMessage = runAgeGate(birthYear)
            }) {
                Text("Continue")
            }
            statusMessage?.let { message ->
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

private fun runAgeGate(birthYearInput: String): String {
    val year = birthYearInput.trim().toIntOrNull()
        ?: return "Enter a valid birth year."
    val currentYear = Calendar.getInstance().get(Calendar.YEAR)
    if (year !in 1900..currentYear) return "Enter a valid birth year."
    val age = currentYear - year
    if (age < 18) return "Must be 18+ to continue."

    return try {
        val summary = DatingCoreBridge.evaluateMockAgeEligibility(
            adult = true,
            ambiguous = false,
            unavailable = false,
        )
        val now = System.currentTimeMillis() / 1000
        DatingCoreBridge.assertDiscoveryAllowed(summary, now)
        "Discovery gate passed (protocol v${DatingCoreBridge.protocolVersion()})."
    } catch (_: DatingCoreBridge.EligibilityError) {
        "Ineligible — fail closed."
    }
}

@Composable
fun StagingTheme(content: @Composable () -> Unit) {
    MaterialTheme(content = content)
}

@Preview(showBackground = true)
@Composable
fun StagingScreenPreview() {
    StagingTheme { StagingScreen() }
}
