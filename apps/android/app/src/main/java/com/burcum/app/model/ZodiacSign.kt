package com.burcum.app.model

import kotlinx.serialization.Serializable

@Serializable
enum class ZodiacSign(
    val id: String,
    val turkishName: String,
    val symbol: String,
    val element: Element,
    val dateRange: String
) {
    KOC("koc", "Koç", "♈", Element.FIRE, "21 Mart - 19 Nisan"),
    BOGA("boga", "Boğa", "♉", Element.EARTH, "20 Nisan - 20 Mayıs"),
    IKIZLER("ikizler", "İkizler", "♊", Element.AIR, "21 Mayıs - 20 Haziran"),
    YENGEC("yengec", "Yengeç", "♋", Element.WATER, "21 Haziran - 22 Temmuz"),
    ASLAN("aslan", "Aslan", "♌", Element.FIRE, "23 Temmuz - 22 Ağustos"),
    BASAK("basak", "Başak", "♍", Element.EARTH, "23 Ağustos - 22 Eylül"),
    TERAZI("terazi", "Terazi", "♎", Element.AIR, "23 Eylül - 22 Ekim"),
    AKREP("akrep", "Akrep", "♏", Element.WATER, "23 Ekim - 21 Kasım"),
    YAY("yay", "Yay", "♐", Element.FIRE, "22 Kasım - 21 Aralık"),
    OGLAK("oglak", "Oğlak", "♑", Element.EARTH, "22 Aralık - 19 Ocak"),
    KOVA("kova", "Kova", "♒", Element.AIR, "20 Ocak - 18 Şubat"),
    BALIK("balik", "Balık", "♓", Element.WATER, "19 Şubat - 20 Mart");

    companion object {
        fun fromId(id: String): ZodiacSign? = entries.find { it.id == id }
    }
}

enum class Element(val turkishName: String) {
    FIRE("Ateş"),
    EARTH("Toprak"),
    AIR("Hava"),
    WATER("Su")
}

enum class ReadingType {
    DAILY, WEEKLY, MONTHLY, YEARLY
}
