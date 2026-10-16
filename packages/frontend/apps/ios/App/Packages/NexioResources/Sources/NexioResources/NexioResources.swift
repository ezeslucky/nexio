// The Swift Programming Language
// https://docs.swift.org/swift-book

import SwiftUI
import UIKit

public enum NexioColors: String, CaseIterable {
  case buttonPrimary = "nexio.button.primary"
  case iconActivated = "nexio.icon.activated"
  case iconPrimary = "nexio.icon.primary"
  case layerBackgroundPrimary = "nexio.layer.background.primary"
  case layerBackgroundSecondary = "nexio.layer.background.secondary"
  case layerBorder = "nexio.layer.border"
  case layerPureWhite = "nexio.layer.pureWhite"
  case textEmphasis = "nexio.text.emphasis"
  case textLink = "nexio.text.link"
  case textListDotAndNumber = "nexio.text.listDotAndNumber"
  case textPlaceholder = "nexio.text.placeholder"
  case textPrimary = "nexio.text.primary"
  case textPureWhite = "nexio.text.pureWhite"
  case textSecondary = "nexio.text.secondary"
  case textTertiary = "nexio.text.tertiary"

  @available(iOS 13.0, *)
  public var color: Color {
    Color(rawValue, bundle: .module)
  }

  public var uiColor: UIColor {
    UIColor(named: rawValue, in: .module, compatibleWith: nil) ?? .clear
  }
}

public typealias AffineColors = NexioColors

public enum NexioIcons: String, CaseIterable {
  case arrowDown = "ArrowDown"
  case arrowUpBig = "ArrowUpBig"
  case box = "Box"
  case broom = "Broom"
  case bubble = "Bubble"
  case calendar = "Calendar"
  case camera = "Camera"
  case checkCircle = "CheckCircle"
  case close = "Close"
  case image = "Image"
  case more = "More"
  case page = "Page"
  case plus = "Plus"
  case settings = "Settings"
  case think = "Think"
  case tools = "Tools"
  case upload = "Upload"
  case web = "Web"

  @available(iOS 13.0, *)
  public var image: Image {
    Image(rawValue, bundle: .module)
  }

  @available(iOS 13.0, *)
  public var uiImage: UIImage {
    UIImage(named: rawValue, in: .module, with: .none) ?? UIImage()
  }
}

public typealias AffineIcons = NexioIcons
