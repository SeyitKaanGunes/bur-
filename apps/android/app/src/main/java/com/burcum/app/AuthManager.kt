package com.burcum.app

import android.content.Context
import com.burcum.app.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthManager(context: Context) {
    private val secureStorage = SecureStorage(context)
    private val apiClient = BurcumApp.instance.apiClient

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    val isAuthenticated: Boolean
        get() = _user.value != null

    val isPremium: Boolean
        get() = _user.value?.subscriptionTier == SubscriptionTier.PREMIUM ||
                _user.value?.subscriptionTier == SubscriptionTier.VIP

    val isVIP: Boolean
        get() = _user.value?.subscriptionTier == SubscriptionTier.VIP

    init {
        // Load saved user
        secureStorage.getUser()?.let { savedUser ->
            _user.value = savedUser
        }
    }

    suspend fun login(email: String, password: String): Boolean {
        _isLoading.value = true
        _error.value = null

        return try {
            val response = apiClient.api.login(LoginRequest(email, password))
            if (response.success && response.data != null) {
                secureStorage.saveToken(response.data.token)
                secureStorage.saveUser(response.data.user)
                _user.value = response.data.user
                true
            } else {
                _error.value = response.error ?: "Giriş başarısız"
                false
            }
        } catch (e: Exception) {
            _error.value = e.message ?: "Bağlantı hatası"
            false
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun register(email: String, password: String, name: String?, birthDate: String?): Boolean {
        _isLoading.value = true
        _error.value = null

        return try {
            val response = apiClient.api.register(
                RegisterRequest(email, password, name, birthDate)
            )
            if (response.success && response.data != null) {
                secureStorage.saveToken(response.data.token)
                secureStorage.saveUser(response.data.user)
                _user.value = response.data.user
                true
            } else {
                _error.value = response.error ?: "Kayıt başarısız"
                false
            }
        } catch (e: Exception) {
            _error.value = e.message ?: "Bağlantı hatası"
            false
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun logout() {
        try {
            apiClient.api.logout()
        } catch (e: Exception) {
            // Ignore logout errors
        }

        secureStorage.clearAll()
        _user.value = null
    }

    suspend fun refreshUser() {
        try {
            val response = apiClient.api.getCurrentUser()
            if (response.success && response.data != null) {
                secureStorage.saveUser(response.data)
                _user.value = response.data
            }
        } catch (e: Exception) {
            // Silent fail
        }
    }

    fun clearError() {
        _error.value = null
    }
}
