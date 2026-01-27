package com.burcum.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.burcum.app.model.ZodiacSign
import com.burcum.app.ui.theme.Purple60
import com.burcum.app.ui.theme.Pink40

@Composable
fun HomeScreen(
    onZodiacClick: (ZodiacSign) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Hero Section
        HeroSection()

        Spacer(modifier = Modifier.height(24.dp))

        // Zodiac Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(ZodiacSign.entries) { sign ->
                ZodiacCard(
                    sign = sign,
                    onClick = { onZodiacClick(sign) }
                )
            }
        }
    }
}

@Composable
private fun HeroSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Burcum",
            fontSize = 42.sp,
            fontWeight = FontWeight.Bold,
            style = MaterialTheme.typography.displayMedium.copy(
                brush = Brush.linearGradient(
                    colors = listOf(Purple60, Pink40)
                )
            )
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Yıldızların Rehberliğinde",
            style = MaterialTheme.typography.titleMedium,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = "Burcunu seç ve günlük yorumunu keşfet",
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray.copy(alpha = 0.8f),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun ZodiacCard(
    sign: ZodiacSign,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        shape = RoundedCornerShape(16.dp),
        border = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = sign.symbol,
                fontSize = 36.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = sign.turkishName,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}
