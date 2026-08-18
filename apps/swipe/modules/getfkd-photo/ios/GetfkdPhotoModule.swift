import ExpoModulesCore
import ImageIO
import Photos
import UniformTypeIdentifiers
import UIKit

public class GetfkdPhotoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("GetfkdPhoto")

    AsyncFunction("encodeProfileHeic") { (uri: String) -> [String: Any] in
      try PhotoEncoder.encode(uri: uri)
    }

    AsyncFunction("stagePickedPhoto") { (uri: String, assetId: String) -> [String: Any] in
      try await PhotoStager.stage(uri: uri, assetId: assetId)
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

private enum PhotoStager {
  static func stage(uri: String, assetId: String) async throws -> [String: Any] {
    if !assetId.isEmpty, let dest = try? await copyLibraryAsset(assetId) {
      return ["uri": dest.absoluteString]
    }
    return ["uri": try copyFile(uri).absoluteString]
  }

  private static func copyLibraryAsset(_ assetId: String) async throws -> URL {
    let fetch = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
    guard let asset = fetch.firstObject else {
      throw PhotoEncodeError.unreadable
    }
    let resources = PHAssetResource.assetResources(for: asset)
    guard
      let resource = resources.first(where: { $0.type == .fullSizePhoto })
        ?? resources.first(where: { $0.type == .photo })
    else {
      throw PhotoEncodeError.unreadable
    }
    let ext = URL(fileURLWithPath: resource.originalFilename).pathExtension
    let dest = FileManager.default.temporaryDirectory
      .appendingPathComponent("getfkd-pick-\(UUID().uuidString).\(ext.isEmpty ? "heic" : ext)")
    let options = PHAssetResourceRequestOptions()
    options.isNetworkAccessAllowed = true
    try await write(resource, to: dest, options: options)
    return dest
  }

  private static func copyFile(_ uri: String) throws -> URL {
    let source = fileURL(from: uri)
    let ext = source.pathExtension.isEmpty ? "heic" : source.pathExtension
    let dest = FileManager.default.temporaryDirectory
      .appendingPathComponent("getfkd-pick-\(UUID().uuidString).\(ext)")
    try FileManager.default.copyItem(at: source, to: dest)
    return dest
  }

  private static func fileURL(from uri: String) -> URL {
    if let url = URL(string: uri), url.isFileURL {
      return url
    }
    let path = uri.replacingOccurrences(of: "file://", with: "")
    return URL(fileURLWithPath: path.removingPercentEncoding ?? path)
  }

  private static func write(
    _ resource: PHAssetResource,
    to dest: URL,
    options: PHAssetResourceRequestOptions
  ) async throws {
    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      PHAssetResourceManager.default().writeData(for: resource, toFile: dest, options: options) { error in
        if let error {
          continuation.resume(throwing: error)
        } else {
          continuation.resume()
        }
      }
    }
  }
}
