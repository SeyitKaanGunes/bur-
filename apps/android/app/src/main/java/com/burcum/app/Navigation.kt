package com.burcum.app

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.burcum.app.model.ZodiacSign
import com.burcum.app.ui.screens.*

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    data object Home : Screen("home", "Burçlar", Icons.Default.Star)
    data object Compatibility : Screen("compatibility", "Uyumluluk", Icons.Default.Favorite)
    data object Profile : Screen("profile", "Profil", Icons.Default.Person)
    data object ZodiacDetail : Screen("zodiac/{signId}", "Burç Detay", Icons.Default.Star)
    data object Premium : Screen("premium", "Premium", Icons.Default.Star)
    data object Auth : Screen("auth", "Giriş", Icons.Default.Person)
}

@Composable
fun BurcumNavHost() {
    val navController = rememberNavController()
    val authManager = BurcumApp.instance.authManager
    val user by authManager.user.collectAsState()

    Scaffold(
        bottomBar = {
            BurcumBottomBar(navController = navController, isAuthenticated = user != null)
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Home.route) {
                HomeScreen(
                    onZodiacClick = { sign ->
                        navController.navigate("zodiac/${sign.id}")
                    }
                )
            }

            composable(Screen.Compatibility.route) {
                CompatibilityScreen()
            }

            composable(Screen.Profile.route) {
                if (user != null) {
                    ProfileScreen(
                        onNavigateToPremium = {
                            navController.navigate(Screen.Premium.route)
                        }
                    )
                } else {
                    AuthScreen(
                        onAuthSuccess = {
                            navController.popBackStack()
                        }
                    )
                }
            }

            composable(
                route = Screen.ZodiacDetail.route,
                arguments = listOf(navArgument("signId") { type = NavType.StringType })
            ) { backStackEntry ->
                val signId = backStackEntry.arguments?.getString("signId") ?: return@composable
                val sign = ZodiacSign.fromId(signId) ?: return@composable

                ZodiacDetailScreen(
                    sign = sign,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToPremium = { navController.navigate(Screen.Premium.route) }
                )
            }

            composable(Screen.Premium.route) {
                PremiumScreen(
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Auth.route) {
                AuthScreen(
                    onAuthSuccess = { navController.popBackStack() }
                )
            }
        }
    }
}

@Composable
fun BurcumBottomBar(navController: NavHostController, isAuthenticated: Boolean) {
    val items = listOf(Screen.Home, Screen.Compatibility, Screen.Profile)
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Hide on detail screens
    if (currentRoute?.startsWith("zodiac/") == true || currentRoute == Screen.Premium.route) {
        return
    }

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        items.forEach { screen ->
            NavigationBarItem(
                icon = { Icon(screen.icon, contentDescription = screen.title) },
                label = { Text(screen.title) },
                selected = currentRoute == screen.route,
                onClick = {
                    if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                )
            )
        }
    }
}
