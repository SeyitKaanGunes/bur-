package com.burcum.app

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.burcum.app.model.User
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class SecureStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "burcum_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val json = Json { ignoreUnknownKeys = true }

    fun saveToken(token: String) {
        sharedPreferences.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString(KEY_TOKEN, null)
    }

    fun deleteToken() {
        sharedPreferences.edit().remove(KEY_TOKEN).apply()
    }

    fun saveUser(user: User) {
        val userJson = json.encodeToString(user)
        sharedPreferences.edit().putString(KEY_USER, userJson).apply()
    }

    fun getUser(): User? {
        val userJson = sharedPreferences.getString(KEY_USER, null) ?: return null
        return try {
            json.decodeFromString<User>(userJson)
        } catch (e: Exception) {
            null
        }
    }

    fun deleteUser() {
        sharedPreferences.edit().remove(KEY_USER).apply()
    }

    fun clearAll() {
        sharedPreferences.edit().clear().apply()
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER = "user_data"
    }
}
