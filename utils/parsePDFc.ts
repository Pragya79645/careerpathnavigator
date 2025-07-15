import * as pdfjsLib from "pdfjs-dist"

// Set up the worker for PDF.js with fallback
if (typeof window !== "undefined") {
  // Primary: Use the local worker file from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
} else {
  // Server-side: Use a CDN worker or disable worker
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
  } catch (error) {
    console.warn("PDF.js worker setup failed on server:", error)
  }
}

// Helper function to handle worker failures
async function createPDFDocument(data: ArrayBuffer) {
  try {
    // Try with the configured worker first
    return await pdfjsLib.getDocument({
      data,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
      cMapPacked: true,
    }).promise
  } catch (workerError) {
    console.warn("Local PDF worker failed, trying CDN fallback:", workerError)
    
    // Fallback: Try with CDN worker
    const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
    
    try {
      return await pdfjsLib.getDocument({
        data,
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      }).promise
    } catch (cdnError) {
      console.warn("CDN PDF worker also failed, using main thread:", cdnError)
      
      // Last resort: Run without worker (on main thread)
      return await pdfjsLib.getDocument({
        data,
        useWorkerFetch: false,
        isEvalSupported: false,
        cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/",
        cMapPacked: true,
      }).promise
    } finally {
      // Restore original worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc
    }
  }
}

interface PDFParseResult {
  text: string
  pageCount: number
  metadata?: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modificationDate?: Date
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const result = await parsePDFFile(file)
    return result.text
  } catch (error) {
    console.error("PDF parsing error:", error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function parsePDFFile(file: File): Promise<PDFParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (!arrayBuffer) {
          throw new Error("Failed to read file as ArrayBuffer")
        }

        // Load the PDF document with robust error handling
        const pdf = await createPDFDocument(arrayBuffer)

        let fullText = ""
        const pageCount = pdf.numPages

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()

          // Combine text items with proper spacing
          const pageText = textContent.items
            .map((item: any) => {
              if ("str" in item) {
                return item.str
              }
              return ""
            })
            .join(" ")
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim()

          if (pageText) {
            fullText += pageText + "\n"
          }
        }

        // Get document metadata
        const metadata = await pdf.getMetadata()
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
          : undefined

        // Clean up the extracted text
        const cleanedText = cleanExtractedText(fullText)

        resolve({
          text: cleanedText,
          pageCount,
          metadata: parsedMetadata,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read PDF file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove common PDF artifacts
      .replace(/\f/g, "\n") // Form feed to newline
      .replace(/\r\n/g, "\n") // Windows line endings
      .replace(/\r/g, "\n") // Mac line endings
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
  )
}

// Alternative method using a different approach for better text extraction
export async function extractTextFromPDFAdvanced(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await createPDFDocument(arrayBuffer)

    let fullText = ""

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // More sophisticated text extraction that preserves structure
      const textItems = textContent.items as any[]
      let pageText = ""
      let lastY = 0
      let lastX = 0

      textItems.forEach((item, index) => {
        if ("str" in item && "transform" in item) {
          const currentY = item.transform[5]
          const currentX = item.transform[4]

          // Add line break if we've moved to a new line (significant Y change)
          if (index > 0 && Math.abs(currentY - lastY) > 5) {
            pageText += "\n"
          }
          // Add space if we've moved horizontally on the same line
          else if (index > 0 && currentX > lastX + 10) {
            pageText += " "
          }

          pageText += item.str
          lastY = currentY
          lastX = currentX + (item.width || 0)
        }
      })

      fullText += pageText + "\n"
    }

    return cleanExtractedText(fullText)
  } catch (error) {
    console.error("Advanced PDF parsing error:", error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Utility function to validate if a file is a valid PDF
export function isPDFFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

// Utility function to get PDF file info without full text extraction
export async function getPDFInfo(file: File): Promise<{ pageCount: number; fileSize: number; metadata?: any }> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const metadata = await pdf.getMetadata()

    return {
      pageCount: pdf.numPages,
      fileSize: file.size,
      metadata: metadata.info,
    }
  } catch (error) {
    throw new Error(`Failed to get PDF info: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
