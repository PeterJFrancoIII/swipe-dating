require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'GetfkdLocation'
  s.version        = package['version']
  s.summary        = 'Reduced-accuracy location authenticity flags for Getfkd'
  s.homepage       = 'https://getfkd.sentineldefensetechnologies.co.za'
  s.license        = 'UNLICENSED'
  s.author         = 'Getfkd'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.source_files   = '*.swift'
  s.dependency 'ExpoModulesCore'
  s.frameworks     = 'CoreLocation'
end
