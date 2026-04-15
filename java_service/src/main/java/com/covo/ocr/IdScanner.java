package com.covo.ocr;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import java.io.File;

/**
 * Covo ID Card Optical Character Recognition (OCR) Service
 * 
 * This module is designed to integrate with the COVO platform for backend 
 * verification of physical ID cards from university students.
 * 
 * Note: For production velocity and edge-computing benefits, the current 
 * active deployment executes this logic natively in the frontend client 
 * using tesseract.js. This Java module is retained for micro-service 
 * architectural compliance and legacy backend verifications.
 */
public class IdScanner {

    public static void main(String[] args) {
        // Initialize the Tesseract OCR engine
        Tesseract tesseract = new Tesseract();
        
        // Path to the downloaded trained data (e.g., eng.traineddata)
        tesseract.setDatapath("src/main/resources/tessdata");
        tesseract.setLanguage("eng");
        
        try {
            System.out.println("--- COVO OCR ENGINE STARTING ---");
            File imageFile = new File("src/main/resources/sample_id_card.png");
            
            if (!imageFile.exists()) {
                System.err.println("Error: Image file not found at " + imageFile.getAbsolutePath());
                return;
            }
            
            // Perform OCR on the image
            String extractedText = tesseract.doOCR(imageFile);
            
            System.out.println("--- EXTRACTION RESULTS ---");
            System.out.println(extractedText);
            
            // Further logic to compare extracted values against Firebase PRN 
            // and Name records would be implemented via a REST Controller.
            
        } catch (TesseractException e) {
            System.err.println("Tesseract failed to extract text from the provided image.");
            e.printStackTrace();
        }
    }
}
