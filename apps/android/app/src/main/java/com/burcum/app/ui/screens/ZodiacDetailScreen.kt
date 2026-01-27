package com.burcum.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.burcum.app.BurcumApp
import com.burcum.app.model.HoroscopeReading
import com.burcum.app.model.ReadingType
import com.burcum.app.model.ZodiacSign
import com.burcum.app.ui.theme.Pink40
import com.burcum.app.ui.theme.Purple60
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ZodiacDetailScreen(
    sign: ZodiacSign,
    onNavigateBack: () -> Unit,
    onNavigateToPremium: () -> Unit
) {
    val apiClient = BurcumApp.instance.apiClient
    val authManager = BurcumApp.instance.authManager
    val user by authManager.user.collectAsState()
    val isPremium = authManager.isPremium

    var selectedTab by remember { mutableStateOf(ReadingType.DAILY) }
    var reading by remember { mutableStateOf<HoroscopeReading?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val scope = rememberCoroutineScope()

    fun loadReading() {
        scope.launch {
            isLoading = true
            error = null

            val result = when (selectedTab) {
                ReadingType.DAILY -> apiClient.getDailyHoroscope(sign)
                ReadingType.WEEKLY -> apiClient.getWeeklyHoroscope(sign)
                ReadingType.MONTHLY -> apiClient.getMonthlyHoroscope(sign)
                ReadingType.YEARLY -> apiClient.getYearlyHoroscope(sign)
            }

            result.fold(
                onSuccess = { reading = it },
                onFailure = { error = it.message }
            )

            isLoading = false
        }
    }

    LaunchedEffect(selectedTab) {
        if (selectedTab == ReadingType.MONTHLY || selectedTab == ReadingType.YEARLY) {
            if (!isPremium) return@LaunchedEffect
        }
        loadReading()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(sign.turkishName) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Geri")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            ZodiacHeader(sign = sign)

            Spacer(modifier = Modifier.height(24.dp))

            // Tab Selector
            TabRow(selectedTab, isPremium) { newTab ->
                selectedTab = newTab
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Content
            when {
                (selectedTab == ReadingType.MONTHLY || selectedTab == ReadingType.YEARLY) && !isPremium -> {
                    PaywallCard(
                        type = selectedTab,
                        onUpgrade = onNavigateToPremium
                    )
                }
                isLoading -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Purple60)
                    }
                }
                error != null -> {
                    ErrorCard(error = error!!) { loadReading() }
                }
                reading != null -> {
                    ReadingCard(reading = reading!!, type = selectedTab)
                }
            }
        }
    }
}

@Composable
private fun ZodiacHeader(sign: ZodiacSign) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = sign.symbol,
            fontSize = 72.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = sign.turkishName,
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = sign.dateRange,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )

        Text(
            text = sign.element.turkishName,
            style = MaterialTheme.typography.labelMedium,
            color = Purple60
        )
    }
}

@Composable
private fun TabRow(
    selectedTab: ReadingType,
    isPremium: Boolean,
    onTabSelect: (ReadingType) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ReadingType.entries.forEach { type ->
            val isSelected = selectedTab == type
            val isPremiumTab = (type == ReadingType.MONTHLY || type == ReadingType.YEARLY) && !isPremium

            Surface(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp)),
                onClick = { onTabSelect(type) },
                color = when {
                    isSelected -> Purple60
                    isPremiumTab -> Purple60.copy(alpha = 0.2f)
                    else -> Color.White.copy(alpha = 0.1f)
                },
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(
                    modifier = Modifier.padding(vertical = 10.dp, horizontal = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = when (type) {
                            ReadingType.DAILY -> "Günlük"
                            ReadingType.WEEKLY -> "Haftalık"
                            ReadingType.MONTHLY -> "Aylık"
                            ReadingType.YEARLY -> "Yıllık"
                        },
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isPremiumTab && !isSelected) Purple60 else Color.White
                    )
                    if (isPremiumTab) {
                        Text(
                            text = "Premium",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
                            color = Color(0xFFFBBF24)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ReadingCard(reading: HoroscopeReading, type: ReadingType) {
    val typeLabel = when (type) {
        ReadingType.DAILY -> "Günün"
        ReadingType.WEEKLY -> "Haftanın"
        ReadingType.MONTHLY -> "Ayın"
        ReadingType.YEARLY -> "Yılın"
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = reading.content,
                style = MaterialTheme.typography.bodyLarge,
                lineHeight = 24.sp
            )

            reading.advice?.let { advice ->
                Spacer(modifier = Modifier.height(16.dp))
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White.copy(alpha = 0.1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "$typeLabel Tavsiyesi",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray
                        )
                        Text(
                            text = advice,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Scores
            if (reading.loveScore != null && reading.careerScore != null && reading.healthScore != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    ScoreItem("Aşk", reading.loveScore, Pink40)
                    ScoreItem("Kariyer", reading.careerScore, Purple60)
                    ScoreItem("Sağlık", reading.healthScore, Color(0xFF10B981))
                }
            }

            // Lucky items
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                reading.luckyNumbers?.let { numbers ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Şanslı Sayılar", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        Text(numbers.joinToString(", "), fontWeight = FontWeight.SemiBold)
                    }
                }
                reading.luckyColor?.let { color ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Şanslı Renk", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        Text(color, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
private fun ScoreItem(label: String, score: Int, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray)
        Box(
            modifier = Modifier
                .size(50.dp)
                .clip(RoundedCornerShape(25.dp))
                .background(color.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = score.toString(),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
        }
    }
}

@Composable
private fun PaywallCard(type: ReadingType, onUpgrade: () -> Unit) {
    val title = if (type == ReadingType.MONTHLY) "Aylık Yorum" else "Yıllık Yorum"

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("🔒", fontSize = 48.sp)

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "$title Premium Özelliğidir",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Detaylı analizler ve tavsiyeler için Premium'a geç.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onUpgrade,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Purple60
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Premium'a Geç")
            }
        }
    }
}

@Composable
private fun ErrorCard(error: String, onRetry: () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("⚠️", fontSize = 48.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(error, color = Color.Gray)
            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onRetry) {
                Text("Tekrar Dene", color = Purple60)
            }
        }
    }
}
