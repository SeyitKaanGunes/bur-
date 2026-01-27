package com.burcum.app

import android.app.Application

class BurcumApp : Application() {

    lateinit var apiClient: ApiClient
        private set

    lateinit var authManager: AuthManager
        private set

    lateinit var subscriptionManager: SubscriptionManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        apiClient = ApiClient(this)
        authManager = AuthManager(this)
        subscriptionManager = SubscriptionManager(this)
    }

    companion object {
        lateinit var instance: BurcumApp
            private set
    }
}
