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
import java.time.DateTimeException
import java.time.LocalDate
import java.time.Period

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
    var birthDate by remember { mutableStateOf("") }
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
                text = "Adults 18+ only · target experience 18–25",
                style = MaterialTheme.typography.bodySmall,
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
                text = "Exact-date adult gate",
                style = MaterialTheme.typography.titleSmall,
            )
            OutlinedTextField(
                value = birthDate,
                onValueChange = { birthDate = it },
                label = { Text("Date of birth (YYYY-MM-DD)") },
                singleLine = true,
            )
            Button(onClick = {
                statusMessage = runAgeGate(birthDate)
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
            Text(
                text = "Get fk'd proximity, sexual-intent modes, maps, and marketplace social features remain unavailable to minors and are staging-only until their release gates pass.",
                style = MaterialTheme.typography.bodySmall,
            )
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

private fun runAgeGate(birthDateInput: String): String {
    val birthDate = try {
        LocalDate.parse(birthDateInput.trim())
    } catch (_: DateTimeException) {
        return "Enter a valid date in YYYY-MM-DD format."
    }

    val today = LocalDate.now()
    if (birthDate.isAfter(today)) return "Enter a valid date of birth."
    val age = Period.between(birthDate, today).years
    if (age < 18) return "Must be 18+ to continue."

    return try {
        val summary = DatingCoreBridge.evaluateMockAgeEligibility(
            adult = true,
            ambiguous = false,
            unavailable = false,
        )
        val now = System.currentTimeMillis() / 1000
        DatingCoreBridge.assertDiscoveryAllowed(summary, now)
        "Adult staging gate passed. Real-user networking still requires a signed network adult credential."
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
