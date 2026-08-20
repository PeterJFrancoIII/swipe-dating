import AVFoundation
import CoreBluetooth
import CoreHaptics
import ExpoModulesCore
import UIKit

enum ProximityRadio {
  static let serviceUUID = CBUUID(string: "F5E1A90C-7B2D-4E11-9C4A-0A1B2C3D4E5F")
}

final class ProximityRadioBox: NSObject, CBCentralManagerDelegate, CBPeripheralManagerDelegate {
  static let shared = ProximityRadioBox()

  private var central: CBCentralManager?
  private var peripheral: CBPeripheralManager?
  private var emit: ((Int) -> Void)?
  private var lastEmitAt: TimeInterval = 0
  private var player: AVAudioPlayer?
  private var haptics: CHHapticEngine?

  func start(emit: @escaping (Int) -> Void) {
    self.emit = emit
    DispatchQueue.main.async {
      if self.central == nil {
        self.central = CBCentralManager(
          delegate: self,
          queue: .main,
          options: [CBCentralManagerOptionShowPowerAlertKey: true]
        )
      }
      if self.peripheral == nil {
        self.peripheral = CBPeripheralManager(delegate: self, queue: .main)
      }
      self.tryScan()
      self.tryAdvertise()
    }
  }

  func stop() {
    DispatchQueue.main.async {
      self.central?.stopScan()
      self.peripheral?.stopAdvertising()
      self.player?.stop()
      self.emit = nil
    }
  }

  func playCue(closeness: Double) {
    let intensity = max(0.12, min(1, closeness))
    DispatchQueue.main.async {
      guard UIApplication.shared.applicationState == .active else {
        return
      }
      self.playDing(closeness: intensity)
      self.playHaptic(closeness: intensity)
    }
  }

  func centralManagerDidUpdateState(_ central: CBCentralManager) {
    tryScan()
  }

  func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
    tryAdvertise()
  }

  func centralManager(
    _ central: CBCentralManager,
    didDiscover peripheral: CBPeripheral,
    advertisementData: [String: Any],
    rssi RSSI: NSNumber
  ) {
    guard UIApplication.shared.applicationState == .active else {
      return
    }
    let rssi = RSSI.intValue
    guard rssi < 0, rssi > -120 else {
      return
    }
    let now = Date().timeIntervalSince1970
    if now - lastEmitAt < 0.22 {
      return
    }
    lastEmitAt = now
    emit?(rssi)
  }

  private func tryScan() {
    guard central?.state == .poweredOn else {
      return
    }
    central?.scanForPeripherals(
      withServices: [ProximityRadio.serviceUUID],
      options: [CBCentralManagerScanOptionAllowDuplicatesKey: true]
    )
  }

  private func tryAdvertise() {
    guard peripheral?.state == .poweredOn else {
      return
    }
    peripheral?.startAdvertising([
      CBAdvertisementDataServiceUUIDsKey: [ProximityRadio.serviceUUID]
    ])
  }

  private func playHaptic(closeness: Double) {
    if CHHapticEngine.capabilitiesForHardware().supportsHaptics {
      do {
        if haptics == nil {
          haptics = try CHHapticEngine()
          try haptics?.start()
        }
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: Float(0.15 + closeness * 0.35))
        let strength = CHHapticEventParameter(parameterID: .hapticIntensity, value: Float(closeness))
        let event = CHHapticEvent(
          eventType: .hapticContinuous,
          parameters: [sharpness, strength],
          relativeTime: 0,
          duration: 0.18 + closeness * 0.28
        )
        let pattern = try CHHapticPattern(events: [event], parameters: [])
        let player = try haptics?.makePlayer(with: pattern)
        try player?.start(atTime: 0)
        return
      } catch {
        // Fall through to impact.
      }
    }
    let style: UIImpactFeedbackGenerator.FeedbackStyle = closeness > 0.65 ? .heavy : closeness > 0.35 ? .medium : .light
    UIImpactFeedbackGenerator(style: style).impactOccurred(intensity: closeness)
  }

  private func playDing(closeness: Double) {
    let sampleRate = 44_100.0
    let duration = 0.11 + closeness * 0.09
    let frequency = 640.0 + closeness * 480.0
    let count = Int(sampleRate * duration)
    var data = Data()
    data.append(contentsOf: wavHeader(samples: count, sampleRate: Int(sampleRate)))
    for index in 0..<count {
      let time = Double(index) / sampleRate
      let envelope = sin(Double.pi * time / duration)
      let sample = sin(2 * Double.pi * frequency * time) * envelope * (0.2 + closeness * 0.62)
      var value = Int16(max(-1, min(1, sample)) * Double(Int16.max))
      data.append(Data(bytes: &value, count: 2))
    }
    do {
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
      try session.setActive(true)
      player = try AVAudioPlayer(data: data)
      player?.volume = Float(0.35 + closeness * 0.65)
      player?.prepareToPlay()
      player?.play()
    } catch {
      // Best effort.
    }
  }

  private func wavHeader(samples: Int, sampleRate: Int) -> [UInt8] {
    let dataSize = UInt32(samples * 2)
    let fileSize = dataSize + 36
    var header: [UInt8] = []
    header += Array("RIFF".utf8)
    header += withUnsafeBytes(of: fileSize.littleEndian, Array.init)
    header += Array("WAVE".utf8)
    header += Array("fmt ".utf8)
    header += withUnsafeBytes(of: UInt32(16).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt16(1).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt16(1).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt32(sampleRate).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt32(sampleRate * 2).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt16(2).littleEndian, Array.init)
    header += withUnsafeBytes(of: UInt16(16).littleEndian, Array.init)
    header += Array("data".utf8)
    header += withUnsafeBytes(of: dataSize.littleEndian, Array.init)
    return header
  }
}
