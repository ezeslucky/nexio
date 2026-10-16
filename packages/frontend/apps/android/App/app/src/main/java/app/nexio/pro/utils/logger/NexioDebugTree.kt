package app.nexio.pro.utils.logger

import timber.log.Timber

class NexioDebugTree : Timber.DebugTree() {

    override fun createStackElementTag(element: StackTraceElement): String {
        return "Nexio:${super.createStackElementTag(element)}:${element.lineNumber}"
    }
}

typealias AffineDebugTree = NexioDebugTree