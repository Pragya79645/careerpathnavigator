// utils/parsePDF.js
// This file handles PDF text extraction using PDF.js CDN

export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(event) {
      try {
        // Ensure PDF.js is loaded
        if (typeof window.pdfjsLib === 'undefined') {
          // Load PDF.js from CDN
          await loadPdfJs();
        }
        
        // Set worker source
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js';
        
        // Load the PDF
        const typedArray = new Uint8Array(event.target.result);
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        
        let fullText = "";
        
        // Iterate through each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text from the page
          const pageText = textContent.items.map(item => item.str).join(" ");
          
          fullText += pageText + "\n";
        }
        
        resolve(fullText.trim());
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = function(error) {
      reject(error);
    };
    
    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to load PDF.js from CDN
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}