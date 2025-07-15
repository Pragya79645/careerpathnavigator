// Client-side only PDF parsing utility
"use client";

import { useEffect, useState } from 'react';

// Type definitions
interface PDFParseResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

// Hook to dynamically import PDF.js only on client side
export function usePDFParser() {
  const [pdfLib, setPdfLib] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadPDFJS = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set up worker
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        }
        
        setPdfLib(pdfjsLib);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load PDF.js:', err);
        setError('Failed to load PDF processing library');
        setIsLoading(false);
      }
    };

    loadPDFJS();
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!pdfLib) {
      throw new Error('PDF library not loaded');
    }

    try {
      const result = await parsePDFFile(file, pdfLib);
      return result.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const parsePDFFile = async (file: File, pdfjsLib: any): Promise<PDFParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error('Failed to read file as ArrayBuffer');
          }

          // Load the PDF document
          const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
            cMapPacked: true,
          }).promise;

          let fullText = "";
          const pageCount = pdf.numPages;

          // Extract text from each page
          for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Combine text items with proper spacing
            const pageText = textContent.items
              .map((item: any) => {
                if ("str" in item) {
                  return item.str;
                }
                return "";
              })
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            if (pageText) {
              fullText += pageText + "\n";
            }
          }

          // Get document metadata
          const metadata = await pdf.getMetadata();
          const info = metadata.info as {
            Title?: string;
            Author?: string;
            Subject?: string;
            Creator?: string;
            Producer?: string;
            CreationDate?: string;
            ModDate?: string;
          } || {};

          const parsedMetadata = metadata.info
            ? {
                title: info.Title || undefined,
                author: info.Author || undefined,
                subject: info.Subject || undefined,
                creator: info.Creator || undefined,
                producer: info.Producer || undefined,
                creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
                modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
              }
            : undefined;

          // Clean up the extracted text
          const cleanedText = cleanExtractedText(fullText);

          resolve({
            text: cleanedText,
            pageCount,
            metadata: parsedMetadata,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const cleanExtractedText = (text: string): string => {
    return (
      text
        // Remove excessive whitespace
        .replace(/\s+/g, " ")
        // Remove common PDF artifacts
        .replace(/\f/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Fix common spacing issues around punctuation
        .replace(/\s+([,.!?;:])/g, "$1")
        .replace(/([,.!?;:])\s*/g, "$1 ")
        // Remove multiple consecutive newlines
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        // Trim whitespace from each line
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n")
        .trim()
    );
  };

  return {
    extractTextFromPDF,
    isLoading,
    error,
    isReady: !isLoading && !error && pdfLib !== null,
  };
}

// Utility function to validate if a file is a valid PDF
export function isPDFFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

// Simple fallback for server-side rendering
export function extractTextFromPDFServer(): Promise<string> {
  return Promise.reject(new Error('PDF processing not available on server side'));
}
