//
//  lib.swift
//  first-coreml
//
//  Created by Deokgon Kim on 5/15/25.
//

import CoreML
import Vision
import AppKit

/// https://rethunk.medium.com/convert-between-nsimage-and-ciimage-in-swift-d6c6180ef026
extension NSImage {
    /// Generates a CIImage from this NSImage
    /// - Returns: A CIImage optional.
    func ciImage() -> CIImage? {
        guard let data = self.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: data) else {
            return nil
        }
        
        let ci = CIImage(bitmapImageRep: bitmap)
        return ci
    }
    
    /// Generates an NSImage from a CIImage
    /// - Parameter ciImage: the CIImage
    /// - Returns: An NSImage optional
    static func fromCIImage(_ ciImage: CIImage) -> NSImage {
        let rep = NSCIImageRep(ciImage: ciImage)
        let nsImage = NSImage(size: rep.size)
        nsImage.addRepresentation(rep)
        return nsImage
    }
}

func classifyImage(_ image: NSImage) {
    guard let model = try? VNCoreMLModel(for: MobileNetV2().model) else {
        print("Failed to load Core ML model")
        return
    }
    
    let request = VNCoreMLRequest(model: model) { request, error in
        guard let results = request.results as? [VNClassificationObservation],
              let topResult = results.first else {
            print("Failed to classify image.")
            return
        }
        
        print("Prediction: \(topResult.identifier) - Confidence: \(topResult.confidence)")
    }
    
    guard let ciImage = image.ciImage() else {
        print("Failed to convert to CIImage")
        return
    }
    
    let handler = VNImageRequestHandler(ciImage: ciImage)
    do {
        try handler.perform([request])
    } catch {
        print("Failed to perform classification.\n\(error.localizedDescription)")
    }
}

