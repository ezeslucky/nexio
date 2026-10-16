package app.nexio.pro

import android.webkit.WebResourceRequest
import android.webkit.WebView
import com.getcapacitor.Bridge
import com.getcapacitor.BridgeWebViewClient

internal class NexioWebViewClient(
    bridge: Bridge,
    private val trustedOrigin: String?,
) : BridgeWebViewClient(bridge) {

    override fun shouldOverrideUrlLoading(
        view: WebView,
        request: WebResourceRequest,
    ): Boolean {
        val shouldOverride = super.shouldOverrideUrlLoading(view, request)
        if (!shouldOverride && request.isForMainFrame) {
            (view as? NexioEditorWebView)?.updateAndroidIMEBridge(
                request.url.toString(),
                trustedOrigin,
            )
        }
        return shouldOverride
    }
}

internal typealias AffineWebViewClient = NexioWebViewClient
