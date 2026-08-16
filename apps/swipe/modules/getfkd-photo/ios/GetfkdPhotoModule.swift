import ExpoModulesCore
import ImageIO
import UniformTypeIdentifiers
import UIKit

public class GetfkdPhotoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GetfkdPhoto")

    AsyncFunction("encodeProfileHeic") { (uri: String) -> [String: Any] in
      try PhotoEncoder.encode(uri: uri)
    }
  }
}

private enum PhotoEncodeError: LocalizedError {
  case unreadable
  case encodeFailed

  var errorDescription: String? {
    switch self {
    case .unreadable:
      return "Could not read that photo."
    case .encodeFailed:
      return "Could not convert that photo to HEIC."
    }
  }
}

private enum PhotoEncoder {
  static let longEdge: CGFloat = 2400
  static let shortEdge: CGFloat = 1080
  static let quality: CGFloat = 0.82

  static func encode(uri: String) throws -> [String: Any] {
    let source = try image(from: uri)
    let fitted = fit(source)
    let data = try heicData(from: fitted)
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("getfkd-photo-\(UUID().uuidString).heic")
    try data.write(to: url, options: .atomic)
    return [
      "uri": url.absoluteString,
      "width": Int(fitted.size.width.rounded()),
      "height": Int(fitted.size.height.rounded()),
    ]
  }

  private static func image(from uri: String) throws -> UIImage {
    if let url = URL(string: uri) {
      if url.isFileURL, let image = UIImage(contentsOfFile: url.path) {
        return image
      }
      if let data = try? Data(contentsOf: url), let image = UIImage(data: data) {
        return image
      }
    }
    let path = uri.replacingOccurrences(of: "file://", with: "")
    let decoded = path.removingPercentEncoding ?? path
    if let image = UIImage(contentsOfFile: decoded) {
      return image
    }
    throw PhotoEncodeError.unreadable
  }

  private static func fit(_ image: UIImage) -> UIImage {
    let width = max(image.size.width, 1)
    let height = max(image.size.height, 1)
    let scale = min(longEdge / max(width, height), shortEdge / min(width, height), 1)
    let size = CGSize(width: (width * scale).rounded(.toNearestOrAwayFromZero), height: (height * scale).rounded(.toNearestOrAwayFromZero))
    if size == image.size {
      return image
    }
    let format = UIGraphicsImageRendererFormat.default()
    format.scale = 1
    format.opaque = true
    return UIGraphicsImageRenderer(size: size, format: format).image { _ in
      image.draw(in: CGRect(origin: .zero, size: size))
    }
  }

  private static func heicData(from image: UIImage) throws -> Data {
    guard let cgImage = image.cgImage else {
      throw PhotoEncodeError.encodeFailed
    }
    let data = NSMutableData()
    guard let destination = CGImageDestinationCreateWithData(
      data,
      UTType.heic.identifier as CFString,
      1,
      nil
    ) else {
      throw PhotoEncodeError.encodeFailed
    }
    let options: [CFString: Any] = [
      kCGImageDestinationLossyCompressionQuality: quality,
    ]
    CGImageDestinationAddImage(destination, cgImage, options as CFDictionary)
    guard CGImageDestinationFinalize(destination) else {
      throw PhotoEncodeError.encodeFailed
    }
    return data as Data
  }
}
