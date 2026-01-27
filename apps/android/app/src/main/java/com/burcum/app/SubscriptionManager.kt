package com.burcum.app

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SubscriptionManager(private val context: Context) : PurchasesUpdatedListener {

    private val _products = MutableStateFlow<List<ProductDetails>>(emptyList())
    val products: StateFlow<List<ProductDetails>> = _products.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val billingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    private val productIds = listOf(
        "com.burcum.premium.monthly",
        "com.burcum.premium.yearly",
        "com.burcum.vip.monthly",
        "com.burcum.vip.yearly"
    )

    init {
        connectBillingClient()
    }

    private fun connectBillingClient() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryProducts()
                }
            }

            override fun onBillingServiceDisconnected() {
                // Retry connection
                connectBillingClient()
            }
        })
    }

    private fun queryProducts() {
        val productList = productIds.map { productId ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(productList)
            .build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                _products.value = productDetailsList
            }
        }
    }

    fun launchPurchaseFlow(activity: Activity, productDetails: ProductDetails) {
        val offerToken = productDetails.subscriptionOfferDetails?.firstOrNull()?.offerToken
            ?: return

        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .setOfferToken(offerToken)
            .build()

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParams))
            .build()

        billingClient.launchBillingFlow(activity, billingFlowParams)
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                purchases?.forEach { purchase ->
                    handlePurchase(purchase)
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                // User cancelled
            }
            else -> {
                _error.value = "Satın alma başarısız"
            }
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(acknowledgePurchaseParams) { billingResult ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        // Purchase acknowledged, update user subscription
                    }
                }
            }
        }
    }

    fun restorePurchases() {
        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.SUBS)
            .build()

        billingClient.queryPurchasesAsync(params) { billingResult, purchaseList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                purchaseList.forEach { purchase ->
                    handlePurchase(purchase)
                }
            }
        }
    }

    fun getProductById(productId: String): ProductDetails? {
        return _products.value.find { it.productId == productId }
    }

    val premiumMonthly: ProductDetails?
        get() = getProductById("com.burcum.premium.monthly")

    val premiumYearly: ProductDetails?
        get() = getProductById("com.burcum.premium.yearly")

    val vipMonthly: ProductDetails?
        get() = getProductById("com.burcum.vip.monthly")

    val vipYearly: ProductDetails?
        get() = getProductById("com.burcum.vip.yearly")
}
