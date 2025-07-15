// polyfills.ts - Browser API polyfills for server-side rendering

// Polyfill for DOMMatrix - used by WebGL and Canvas libraries
declare global {
  interface Window {
    DOMMatrix: typeof DOMMatrix;
  }
}

// Simple DOMMatrix polyfill for server-side rendering
if (typeof window === 'undefined') {
  // Server-side polyfill
  global.DOMMatrix = class DOMMatrix {
    m11: number = 1;
    m12: number = 0;
    m13: number = 0;
    m14: number = 0;
    m21: number = 0;
    m22: number = 1;
    m23: number = 0;
    m24: number = 0;
    m31: number = 0;
    m32: number = 0;
    m33: number = 1;
    m34: number = 0;
    m41: number = 0;
    m42: number = 0;
    m43: number = 0;
    m44: number = 1;
    
    constructor(init?: string | number[]) {
      // Basic constructor - just return identity matrix
      if (Array.isArray(init)) {
        if (init.length >= 16) {
          this.m11 = init[0]; this.m12 = init[1]; this.m13 = init[2]; this.m14 = init[3];
          this.m21 = init[4]; this.m22 = init[5]; this.m23 = init[6]; this.m24 = init[7];
          this.m31 = init[8]; this.m32 = init[9]; this.m33 = init[10]; this.m34 = init[11];
          this.m41 = init[12]; this.m42 = init[13]; this.m43 = init[14]; this.m44 = init[15];
        }
      }
    }
    
    static fromMatrix(matrix: any): DOMMatrix {
      return new DOMMatrix();
    }
    
    translate(tx: number, ty: number, tz?: number): DOMMatrix {
      return new DOMMatrix();
    }
    
    scale(sx: number, sy?: number, sz?: number): DOMMatrix {
      return new DOMMatrix();
    }
    
    rotate(angle: number): DOMMatrix {
      return new DOMMatrix();
    }
    
    multiply(matrix: DOMMatrix): DOMMatrix {
      return new DOMMatrix();
    }
    
    inverse(): DOMMatrix {
      return new DOMMatrix();
    }
  };
}

// Polyfill for other WebGL/Canvas related APIs that might be missing
if (typeof window === 'undefined') {
  // Mock HTMLCanvasElement
  global.HTMLCanvasElement = class HTMLCanvasElement {
    width: number = 300;
    height: number = 150;
    
    getContext(contextId: string): any {
      return null;
    }
    
    toDataURL(): string {
      return '';
    }
  } as any;
  
  // Mock CanvasRenderingContext2D
  global.CanvasRenderingContext2D = class CanvasRenderingContext2D {
    canvas: HTMLCanvasElement = new HTMLCanvasElement();
    
    clearRect(): void {}
    fillRect(): void {}
    strokeRect(): void {}
    beginPath(): void {}
    closePath(): void {}
    moveTo(): void {}
    lineTo(): void {}
    arc(): void {}
    fill(): void {}
    stroke(): void {}
  } as any;
  
  // Mock WebGLRenderingContext
  global.WebGLRenderingContext = class WebGLRenderingContext {
    canvas: HTMLCanvasElement = new HTMLCanvasElement();
    
    createShader(): any { return null; }
    createProgram(): any { return null; }
    createBuffer(): any { return null; }
    createTexture(): any { return null; }
    shaderSource(): void {}
    compileShader(): void {}
    attachShader(): void {}
    linkProgram(): void {}
    useProgram(): void {}
    bindBuffer(): void {}
    bufferData(): void {}
    vertexAttribPointer(): void {}
    enableVertexAttribArray(): void {}
    drawArrays(): void {}
    viewport(): void {}
    clear(): void {}
    clearColor(): void {}
    enable(): void {}
    disable(): void {}
    getUniformLocation(): any { return null; }
    uniform1f(): void {}
    uniform2f(): void {}
    uniform3f(): void {}
    uniform4f(): void {}
    uniformMatrix4fv(): void {}
  } as any;
  
  // Mock other commonly used browser APIs
  global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(callback, 16);
  };
  
  global.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
  
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
  } as any;
}

export {};
