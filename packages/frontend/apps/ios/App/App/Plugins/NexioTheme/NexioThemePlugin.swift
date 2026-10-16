import Capacitor
import UIKit

protocol NexioThemeConfigurable: AnyObject {
  var appThemeUserInterfaceStyle: UIUserInterfaceStyle { get set }
}

enum NexioThemeStorage {
  static let modeKey = "nexio.theme.mode"
}

private enum NexioThemeMode: String {
  case dark
  case light
  case system

  var userInterfaceStyle: UIUserInterfaceStyle {
    switch self {
    case .dark:
      .dark
    case .light:
      .light
    case .system:
      .unspecified
    }
  }
}

@objc(NexioThemePlugin)
public final class NexioThemePlugin: CAPPlugin, CAPBridgedPlugin {
  init(associatedController: UIViewController?) {
    controller = associatedController
    super.init()

    let cachedMode = NexioThemeMode(rawValue: UserDefaults.standard.string(forKey: NexioThemeStorage.modeKey) ?? "") ?? .system
    (associatedController as? NexioThemeConfigurable)?.appThemeUserInterfaceStyle = cachedMode.userInterfaceStyle
  }

  weak var controller: UIViewController?

  public let identifier = "NexioThemePlugin"
  public let jsName = "NexioTheme"
  public let pluginMethods: [CAPPluginMethod] = [
    CAPPluginMethod(name: "onThemeChanged", returnType: CAPPluginReturnPromise),
  ]

  @objc func onThemeChanged(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      let themeMode = NexioThemeMode(rawValue: call.getString("themeMode") ?? "") ?? .system
      UserDefaults.standard.set(themeMode.rawValue, forKey: NexioThemeStorage.modeKey)
      (self.controller as? NexioThemeConfigurable)?.appThemeUserInterfaceStyle = themeMode.userInterfaceStyle
      call.resolve()
    }
  }
}

// Backwards compatibility alias
typealias AffineThemeConfigurable = NexioThemeConfigurable
typealias AffineThemePlugin = NexioThemePlugin
