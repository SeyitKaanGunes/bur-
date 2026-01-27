package com.burcum.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Cosmic purple theme colors
val Purple80 = Color(0xFFCFBCFF)
val Purple60 = Color(0xFF8B5CF6)
val Purple40 = Color(0xFF6366F1)
val Pink80 = Color(0xFFFFB8C8)
val Pink40 = Color(0xFFEC4899)

val CosmicBackground = Color(0xFF0F0520)
val CosmicSurface = Color(0xFF1A0A30)
val CosmicSurfaceVariant = Color(0xFF2D1B4E)

private val DarkColorScheme = darkColorScheme(
    primary = Purple60,
    secondary = Pink40,
    tertiary = Purple40,
    background = CosmicBackground,
    surface = CosmicSurface,
    surfaceVariant = CosmicSurfaceVariant,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White,
)

@Composable
fun BurcumTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = CosmicBackground.toArgb()
            window.navigationBarColor = CosmicBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
