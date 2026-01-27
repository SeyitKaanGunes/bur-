package com.burcum.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.burcum.app.BurcumApp
import com.burcum.app.model.SubscriptionTier
import com.burcum.app.model.ZodiacSign
import com.burcum.app.ui.theme.Pink40
import com.burcum.app.ui.theme.Purple60
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    onNavigateToPremium: () -> Unit
) {
    val authManager = BurcumApp.instance.authManager
    val subscriptionManager = BurcumApp.instance.subscriptionManager
    val user by authManager.user.collectAsState()

    var showLogoutDialog by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Profile Header
        user?.let { currentUser ->
            ProfileHeader(
                name = currentUser.name,
                email = currentUser.email,
                zodiacSign = currentUser.zodiacSign?.let { ZodiacSign.fromId(it) }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Subscription Card
        SubscriptionCard(
            tier = user?.subscriptionTier ?: SubscriptionTier.FREE,
            onUpgrade = onNavigateToPremium
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Settings Menu
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ) {
            Column {
                SettingsItem(
                    icon = Icons.Default.Notifications,
                    title = "Bildirimler",
                    iconColor = Color(0xFFF97316),
                    onClick = { }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                SettingsItem(
                    icon = Icons.Default.Email,
                    title = "E-posta Tercihleri",
                    iconColor = Color(0xFF3B82F6),
                    onClick = { }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                SettingsItem(
                    icon = Icons.Default.Lock,
                    title = "Gizlilik",
                    iconColor = Color(0xFF10B981),
                    onClick = { }
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.1f))
                SettingsItem(
                    icon = Icons.Default.Refresh,
                    title = "Satın Almaları Geri Yükle",
                    iconColor = Color(0xFF06B6D4),
                    onClick = { subscriptionManager.restorePurchases() }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Logout Button
        OutlinedButton(
            onClick = { showLogoutDialog = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color.Red
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Çıkış Yap")
        }
    }

    // Logout Dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Çıkış Yap") },
            text = { Text("Hesabından çıkış yapmak istediğine emin misin?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        scope.launch {
                            authManager.logout()
                        }
                        showLogoutDialog = false
                    }
                ) {
                    Text("Çıkış Yap", color = Color.Red)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("İptal")
                }
            }
        )
    }
}

@Composable
private fun ProfileHeader(
    name: String?,
    email: String,
    zodiacSign: ZodiacSign?
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(listOf(Purple60, Pink40))
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (zodiacSign != null) {
                    Text(zodiacSign.symbol, fontSize = 44.sp)
                } else {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(40.dp),
                        tint = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            name?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            Text(
                text = email,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray
            )

            zodiacSign?.let { sign ->
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "${sign.turkishName} • ${sign.dateRange}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Purple60
                )
            }
        }
    }
}

@Composable
private fun SubscriptionCard(
    tier: SubscriptionTier,
    onUpgrade: () -> Unit
) {
    val (label, color, icon) = when (tier) {
        SubscriptionTier.VIP -> Triple("VIP Üye", Color(0xFFFBBF24), Icons.Default.Star)
        SubscriptionTier.PREMIUM -> Triple("Premium Üye", Purple60, Icons.Default.Star)
        SubscriptionTier.FREE -> Triple("Ücretsiz", Color.Gray, Icons.Default.Person)
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "Üyelik Durumu",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                    Text(
                        label,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = color
                    )
                }

                Icon(
                    icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(32.dp)
                )
            }

            if (tier == SubscriptionTier.FREE) {
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onUpgrade,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Purple60),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Premium'a Geç")
                }
            }
        }
    }
}

@Composable
private fun SettingsItem(
    icon: ImageVector,
    title: String,
    iconColor: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon,
                contentDescription = null,
                tint = iconColor,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Text(
                title,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodyLarge
            )

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
