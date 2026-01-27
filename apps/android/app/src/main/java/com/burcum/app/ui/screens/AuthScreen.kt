package com.burcum.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.burcum.app.BurcumApp
import com.burcum.app.ui.theme.Pink40
import com.burcum.app.ui.theme.Purple60
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    onAuthSuccess: () -> Unit
) {
    val authManager = BurcumApp.instance.authManager
    val isLoading by authManager.isLoading.collectAsState()
    val error by authManager.error.collectAsState()

    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    LaunchedEffect(authManager.user) {
        authManager.user.collect { user ->
            if (user != null) onAuthSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))

        // Logo
        Text("✨", fontSize = 60.sp)

        Text(
            text = "Burcum",
            fontSize = 42.sp,
            fontWeight = FontWeight.Bold,
            style = LocalTextStyle.current.copy(
                brush = Brush.linearGradient(listOf(Purple60, Pink40))
            )
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Tab Selector
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            color = Color.White.copy(alpha = 0.1f)
        ) {
            Row {
                TabButton(
                    text = "Giriş Yap",
                    isSelected = isLogin,
                    onClick = { isLogin = true },
                    modifier = Modifier.weight(1f)
                )
                TabButton(
                    text = "Kayıt Ol",
                    isSelected = !isLogin,
                    onClick = { isLogin = false },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Form
        if (!isLogin) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Ad Soyad") },
                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Purple60,
                    unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f)
                )
            )

            Spacer(modifier = Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("E-posta") },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Purple60,
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f)
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Şifre") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = { showPassword = !showPassword }) {
                    Icon(
                        if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = "Şifre göster"
                    )
                }
            },
            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Purple60,
                unfocusedBorderColor = Color.Gray.copy(alpha = 0.5f)
            )
        )

        error?.let {
            Spacer(modifier = Modifier.height(8.dp))
            Text(it, color = Color.Red, style = MaterialTheme.typography.bodySmall)
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                scope.launch {
                    authManager.clearError()
                    if (isLogin) {
                        authManager.login(email, password)
                    } else {
                        authManager.register(email, password, name.ifBlank { null }, null)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            enabled = email.isNotBlank() && password.length >= 6 && !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = Purple60),
            shape = RoundedCornerShape(12.dp)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(if (isLogin) "Giriş Yap" else "Kayıt Ol")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("veya", color = Color.Gray)

        Spacer(modifier = Modifier.height(16.dp))

        // Google Sign In (placeholder)
        OutlinedButton(
            onClick = { /* TODO: Google Sign In */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Google ile devam et")
        }
    }
}

@Composable
private fun TabButton(
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
                fontWeight = FontWeight.Medium,
                color = if (isSelected) Color.White else Color.Gray
            )
        }
    }
}
