package app.nexio.pro.service

import app.nexio.pro.NexioApp
import app.nexio.pro.CapacitorConfig
import app.nexio.pro.utils.dataStore
import app.nexio.pro.utils.del
import app.nexio.pro.utils.set
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import timber.log.Timber
import java.util.concurrent.ConcurrentHashMap

object OkHttp {

    val client = OkHttpClient.Builder()
        .cookieJar(object : CookieJar {

            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                val cookies = CookieStore.getCookies(url.host)
                Timber.d("load cookies: [ url = $url, cookies = $cookies]")
                return cookies
            }

            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                Timber.d("save cookies: [ url = $url, cookies = $cookies]")
                CookieStore.saveCookies(url.host, cookies)
            }
        })
        .addInterceptor {
            it.proceed(
                it.request()
                    .newBuilder()
                    .addHeader("x-affine-version", CapacitorConfig.getAffineVersion())
                    .build()
            )
        }
        .addInterceptor(HttpLoggingInterceptor { msg ->
            Timber.d(msg)
        }.apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

}

object AuthHttp {
    val client = OkHttpClient.Builder()
        .cookieJar(CookieJar.NO_COOKIES)
        .addInterceptor {
            it.proceed(
                it.request()
                    .newBuilder()
                    .addHeader("x-affine-version", CapacitorConfig.getAffineVersion())
                    .build()
            )
        }
        .build()
}

object CookieStore {

    const val AFFINE_SESSION = "affine_session"
    const val AFFINE_USER_ID = "affine_user_id"
    const val AFFINE_CSRF_TOKEN = "affine_csrf_token"

    private val _cookies = ConcurrentHashMap<String, List<Cookie>>()

    fun saveCookies(host: String, cookies: List<Cookie>) {
        _cookies[host] = cookies
        MainScope().launch(Dispatchers.IO) {
            cookies.find { it.name == AFFINE_USER_ID }?.let {
                Timber.d("Update user id [${it.value}]")
                NexioApp.context().dataStore.set(host + AFFINE_USER_ID, it.toString())
                Firebase.crashlytics.setUserId(it.value)
            }
            cookies.find { it.name == AFFINE_CSRF_TOKEN }?.let {
                NexioApp.context().dataStore.set(host + AFFINE_CSRF_TOKEN, it.toString())
            }
        }
    }

    fun getCookies(host: String) = _cookies[host] ?: emptyList()

    fun clearAuthCookies(host: String) {
        val cookies = _cookies[host] ?: emptyList()
        _cookies[host] = cookies.filter {
            it.name != AFFINE_SESSION && it.name != AFFINE_USER_ID && it.name != AFFINE_CSRF_TOKEN
        }
        MainScope().launch(Dispatchers.IO) {
            NexioApp.context().dataStore.del(host + AFFINE_USER_ID)
            NexioApp.context().dataStore.del(host + AFFINE_CSRF_TOKEN)
            Firebase.crashlytics.setUserId("")
        }
    }

    fun getCookie(url: HttpUrl, name: String) = url.host
        .let { _cookies[it] }
        ?.find { cookie -> cookie.name == name }
        ?.value
}
