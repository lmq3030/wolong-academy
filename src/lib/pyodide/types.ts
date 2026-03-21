export interface PyodideMessage {
  id: string;
  type: 'run' | 'init';
  code?: string;
  timeout?: number; // ms, default 5000
}

export interface PyodideResult {
  id: string;
  success: boolean;
  output: string;    // captured stdout
  error?: string;    // error message if failed
  duration: number;  // ms
}

export type PyodideStatus = 'loading' | 'ready' | 'error';
