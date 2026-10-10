require 'json'
Pod::Spec.new do |s|
  s.name = 'MonoKeyAutofill'
  s.version = '0.1.0'
  s.summary = 'Local client-only MonoKey native autofill and clipboard bridge'
  s.description = 'Client-only integration; no server decryption keys or plaintext persistence.'
  s.license = { :type => 'Proprietary' }
  s.author = 'MonoKey'
  s.homepage = 'https://github.com/ccankayaa/MonoKey'
  s.platforms = { :ios => '16.4' }
  s.source = { :git => 'https://github.com/ccankayaa/MonoKey.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.swift_version = '5.9'
end
