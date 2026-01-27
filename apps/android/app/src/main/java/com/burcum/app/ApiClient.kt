package com.burcum.app

import android.content.Context
import com.burcum.app.model.*
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface BurcumApiService {
    @GET("horoscope/daily/{sign}")
    suspend fun getDailyHoroscope(@Path("sign") sign: String): ApiResponse<HoroscopeReading>

    @GET("horoscope/weekly/{sign}")
    suspend fun getWeeklyHoroscope(@Path("sign") sign: String): ApiResponse<HoroscopeReading>

    @GET("horoscope/monthly/{sign}")
    suspend fun getMonthlyHoroscope(@Path("sign") sign: String): ApiResponse<HoroscopeReading>

    @GET("horoscope/yearly/{sign}")
    suspend fun getYearlyHoroscope(@Path("sign") sign: String): ApiResponse<HoroscopeReading>

    @POST("compatibility")
    suspend fun getCompatibility(@Body request: CompatibilityRequest): ApiResponse<CompatibilityResult>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthResponse>

    @POST("auth/logout")
    suspend fun logout(): ApiResponse<Unit>

    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<User>
}

class ApiClient(private val context: Context) {
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    private val secureStorage = SecureStorage(context)

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")

            secureStorage.getToken()?.let { token ->
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }

            chain.proceed(requestBuilder.build())
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        })
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("https://burcum.site/api/")
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    val api: BurcumApiService = retrofit.create(BurcumApiService::class.java)

    // Convenience methods
    suspend fun getDailyHoroscope(sign: ZodiacSign): Result<HoroscopeReading> = runCatching {
        val response = api.getDailyHoroscope(sign.id)
        response.data ?: throw Exception(response.error ?: "Veri alınamadı")
    }

    suspend fun getWeeklyHoroscope(sign: ZodiacSign): Result<HoroscopeReading> = runCatching {
        val response = api.getWeeklyHoroscope(sign.id)
        response.data ?: throw Exception(response.error ?: "Veri alınamadı")
    }

    suspend fun getMonthlyHoroscope(sign: ZodiacSign): Result<HoroscopeReading> = runCatching {
        val response = api.getMonthlyHoroscope(sign.id)
        response.data ?: throw Exception(response.error ?: "Veri alınamadı")
    }

    suspend fun getYearlyHoroscope(sign: ZodiacSign): Result<HoroscopeReading> = runCatching {
        val response = api.getYearlyHoroscope(sign.id)
        response.data ?: throw Exception(response.error ?: "Veri alınamadı")
    }

    suspend fun getCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): Result<CompatibilityResult> = runCatching {
        val response = api.getCompatibility(CompatibilityRequest(sign1.id, sign2.id))
        response.data ?: throw Exception(response.error ?: "Uyumluluk hesaplanamadı")
    }
}
