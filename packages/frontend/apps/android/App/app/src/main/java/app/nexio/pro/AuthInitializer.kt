package app.nexio.pro

import android.webkit.WebView
import app.nexio.pro.utils.getCurrentServerBaseUrl
import app.nexio.pro.utils.logger.FileTree
import com.getcapacitor.Bridge
import com.getcapacitor.WebViewListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import okhttp3.HttpUrl.Companion.toHttpUrl
import timber.log.Timber

object AuthInitializer {

    fun initialize(bridge: Bridge) {
        bridge.addWebViewListener(object : WebViewListener() {
            override fun onPageLoaded(webView: WebView?) {
                webView?.post { bridge.removeWebViewListener(this) }
                MainScope().launch(Dispatchers.IO) {
                    try {
                        FileTree.get()?.checkAndUploadOldLogs(
                            bridge.getCurrentServerBaseUrl().toHttpUrl()
                        )
                    } catch (e: Exception) {
                        Timber.w(e, "[init] auth initializer fail.")
                    }
                }
            }
        })
    }

}
