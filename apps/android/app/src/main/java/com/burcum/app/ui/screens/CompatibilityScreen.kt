package com.burcum.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.burcum.app.BurcumApp
import com.burcum.app.model.CompatibilityResult
import com.burcum.app.model.ZodiacSign
import com.burcum.app.ui.theme.Pink40
import com.burcum.app.ui.theme.Purple60
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompatibilityScreen() {
    val apiClient = BurcumApp.instance.apiClient

    var sign1 by remember { mutableStateOf<ZodiacSign?>(null) }
    var sign2 by remember { mutableStateOf<ZodiacSign?>(null) }
    var result by remember { mutableStateOf<CompatibilityResult?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    var showPicker1 by remember { mutableStateOf(false) }
    var showPicker2 by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Burç Uyumluluğu",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "İki burç arasındaki uyumu keşfet",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Sign Selectors
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            SignSelector(
                title = "Birinci Burç",
                sign = sign1,
                onClick = { showPicker1 = true }
            )

            Icon(
                Icons.Default.Favorite,
                contentDescription = null,
                tint = Pink40,
                modifier = Modifier.size(32.dp)
            )

            SignSelector(
                title = "İkinci Burç",
                sign = sign2,
                onClick = { showPicker2 = true }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Calculate Button
        Button(
            onClick = {
                if (sign1 != null && sign2 != null) {
                    scope.launch {
                        isLoading = true
                        error = null
                        apiClient.getCompatibility(sign1!!, sign2!!).fold(
                            onSuccess = { result = it },
                            onFailure = { error = it.message }
                        )
                        isLoading = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = sign1 != null && sign2 != null && !isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = Pink40
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text("Uyumu Hesapla ✨", modifier = Modifier.padding(8.dp))
            }
        }

        error?.let {
            Spacer(modifier = Modifier.height(8.dp))
            Text(it, color = Color.Red, style = MaterialTheme.typography.bodySmall)
        }

        // Result
        result?.let { compatResult ->
            Spacer(modifier = Modifier.height(24.dp))
            CompatibilityResultCard(result = compatResult)
        }
    }

    // Sign Pickers
    if (showPicker1) {
        SignPickerDialog(
            selectedSign = sign1,
            onDismiss = { showPicker1 = false },
            onSelect = { sign1 = it; showPicker1 = false }
        )
    }

    if (showPicker2) {
        SignPickerDialog(
            selectedSign = sign2,
            onDismiss = { showPicker2 = false },
            onSelect = { sign2 = it; showPicker2 = false }
        )
    }
}

@Composable
private fun SignSelector(
    title: String,
    sign: ZodiacSign?,
    onClick: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(8.dp))

        Surface(
            modifier = Modifier
                .size(100.dp)
                .clip(RoundedCornerShape(20.dp))
                .clickable(onClick = onClick),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
            shape = RoundedCornerShape(20.dp)
        ) {
            Box(
                contentAlignment = Alignment.Center
            ) {
                if (sign != null) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(sign.symbol, fontSize = 40.sp)
                        Text(sign.turkishName, style = MaterialTheme.typography.labelSmall)
                    }
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Seç",
                            tint = Purple60,
                            modifier = Modifier.size(40.dp)
                        )
                        Text("Seç", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                    }
                }
            }
        }
    }
}

@Composable
private fun SignPickerDialog(
    selectedSign: ZodiacSign?,
    onDismiss: () -> Unit,
    onSelect: (ZodiacSign) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Burç Seç") },
        text = {
            Column {
                ZodiacSign.entries.chunked(3).forEach { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        row.forEach { sign ->
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onSelect(sign) },
                                color = if (selectedSign == sign)
                                    Purple60.copy(alpha = 0.3f)
                                else
                                    Color.Transparent,
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(8.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(sign.symbol, fontSize = 28.sp)
                                    Text(
                                        sign.turkishName,
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Kapat")
            }
        }
    )
}

@Composable
private fun CompatibilityResultCard(result: CompatibilityResult) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Overall Score
            Text(
                "Genel Uyum",
                style = MaterialTheme.typography.titleMedium,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(listOf(Pink40.copy(alpha = 0.3f), Purple60.copy(alpha = 0.3f)))
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        "${result.overallScore}",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text("%", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Category Scores
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                CategoryScoreItem("Aşk", result.loveScore, Pink40)
                CategoryScoreItem("Arkadaşlık", result.friendshipScore, Color(0xFF3B82F6))
                CategoryScoreItem("İş", result.workScore, Color(0xFFF97316))
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Analysis
            Text(
                "Analiz",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Text(
                result.analysis,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Advice
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = Purple60.copy(alpha = 0.1f)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        "Tavsiye",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        result.advice,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryScoreItem(label: String, score: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            "${score}%",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
    }
}
