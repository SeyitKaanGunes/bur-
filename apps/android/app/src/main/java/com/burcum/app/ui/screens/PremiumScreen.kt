package com.burcum.app.ui.screens

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.android.billingclient.api.ProductDetails
import com.burcum.app.BurcumApp
import com.burcum.app.ui.theme.Pink40
import com.burcum.app.ui.theme.Purple60

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumScreen(
    onNavigateBack: () -> Unit
) {
    val subscriptionManager = BurcumApp.instance.subscriptionManager
    val products by subscriptionManager.products.collectAsState()
    val isLoading by subscriptionManager.isLoading.collectAsState()

    var isYearly by remember { mutableStateOf(true) }
    val activity = LocalContext.current as Activity

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Geri")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Text("✨", fontSize = 60.sp)

            Text(
                "Premium'a Geç",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                "Sınırsız erişim, detaylı yorumlar ve kişisel AI danışman",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Period Toggle
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = Color.White.copy(alpha = 0.1f)
            ) {
                Row {
                    PeriodButton(
                        text = "Aylık",
                        isSelected = !isYearly,
                        onClick = { isYearly = false },
                        modifier = Modifier.weight(1f)
                    )
                    PeriodButton(
                        text = "Yıllık (2 ay bedava)",
                        isSelected = isYearly,
                        onClick = { isYearly = true },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Plans
            PlanCard(
                title = "Premium",
                price = if (isYearly) "₺299.99/yıl" else "₺29.99/ay",
                originalPrice = if (isYearly) "₺359.88" else null,
                features = listOf(
                    "Sınırsız günlük okuma",
                    "Haftalık ve aylık yorumlar",
                    "Detaylı uyumluluk analizi",
                    "Reklamsız deneyim"
                ),
                color = Purple60,
                isHighlighted = false,
                product = if (isYearly) subscriptionManager.premiumYearly else subscriptionManager.premiumMonthly,
                onPurchase = { product ->
                    subscriptionManager.launchPurchaseFlow(activity, product)
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            PlanCard(
                title = "VIP",
                price = if (isYearly) "₺499.99/yıl" else "₺49.99/ay",
                originalPrice = if (isYearly) "₺599.88" else null,
                features = listOf(
                    "Premium'un tüm özellikleri",
                    "Yıllık detaylı yorumlar",
                    "Kişisel AI astroloji danışmanı",
                    "Öncelikli destek"
                ),
                color = Color(0xFFFBBF24),
                isHighlighted = true,
                product = if (isYearly) subscriptionManager.vipYearly else subscriptionManager.vipMonthly,
                onPurchase = { product ->
                    subscriptionManager.launchPurchaseFlow(activity, product)
                }
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Restore Purchases
            TextButton(onClick = { subscriptionManager.restorePurchases() }) {
                Text("Satın Almaları Geri Yükle", color = Color.Gray)
            }

            // Terms
            Text(
                "Abonelik otomatik yenilenir. Google Play ayarlarından iptal edebilirsiniz.",
                style = MaterialTheme.typography.labelSmall,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun PeriodButton(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        onClick = onClick,
        color = if (isSelected) Purple60 else Color.Transparent,
        shape = RoundedCornerShape(12.dp)
    ) {
        Box(
            modifier = Modifier.padding(vertical = 12.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Medium,
                color = if (isSelected) Color.White else Color.Gray
            )
        }
    }
}

@Composable
private fun PlanCard(
    title: String,
    price: String,
    originalPrice: String?,
    features: List<String>,
    color: Color,
    isHighlighted: Boolean,
    product: ProductDetails?,
    onPurchase: (ProductDetails) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = if (isHighlighted) {
            ButtonDefaults.outlinedButtonBorder.copy(
                brush = androidx.compose.ui.graphics.SolidColor(color)
            )
        } else null
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    if (isHighlighted) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = color
                        ) {
                            Text(
                                "EN POPÜLER",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                    Text(
                        title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    originalPrice?.let {
                        Text(
                            it,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray,
                            textDecoration = TextDecoration.LineThrough
                        )
                    }
                    Text(
                        price,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = color
                    )
                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 16.dp),
                color = Color.White.copy(alpha = 0.1f)
            )

            // Features
            features.forEach { feature ->
                Row(
                    modifier = Modifier.padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = color,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        feature,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Buy Button
            Button(
                onClick = { product?.let { onPurchase(it) } },
                modifier = Modifier.fillMaxWidth(),
                enabled = product != null,
                colors = ButtonDefaults.buttonColors(containerColor = color),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    "Satın Al",
                    color = if (isHighlighted) Color.Black else Color.White
                )
            }
        }
    }
}
