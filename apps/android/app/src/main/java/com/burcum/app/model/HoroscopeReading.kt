package com.burcum.app.model

import kotlinx.serialization.Serializable

@Serializable
data class HoroscopeReading(
    val id: String,
    val zodiacSign: String,
    val readingType: String,
    val content: String,
    val advice: String? = null,
    val loveScore: Int? = null,
    val careerScore: Int? = null,
    val healthScore: Int? = null,
    val luckyNumbers: List<Int>? = null,
    val luckyColor: String? = null,
    val createdAt: String
)

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val cached: Boolean? = null
)

@Serializable
data class CompatibilityResult(
    val sign1: String,
    val sign2: String,
    val overallScore: Int,
    val loveScore: Int,
    val friendshipScore: Int,
    val workScore: Int,
    val analysis: String,
    val strengths: List<String>,
    val challenges: List<String>,
    val advice: String
)

@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String? = null,
    val zodiacSign: String? = null,
    val birthDate: String? = null,
    val subscriptionTier: SubscriptionTier = SubscriptionTier.FREE,
    val emailVerified: Boolean = false
)

@Serializable
enum class SubscriptionTier {
    FREE, PREMIUM, VIP
}

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String? = null,
    val birthDate: String? = null
)

@Serializable
data class AuthResponse(
    val user: User,
    val token: String
)

@Serializable
data class CompatibilityRequest(
    val sign1: String,
    val sign2: String
)
