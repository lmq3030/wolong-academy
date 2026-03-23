/**
 * AudioWorklet processor for microphone capture.
 * Captures audio at the AudioContext's sample rate and resamples to 16kHz PCM int16.
 * Sends 3200-byte chunks (100ms at 16kHz, 1600 samples × 2 bytes) to the main thread.
 */
class MicProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    // 1600 samples = 100ms at 16kHz
    this.targetSamples = 1600;
    this.targetRate = 16000;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0]; // mono
    const inputRate = sampleRate; // global from AudioWorkletGlobalScope

    // Resample to 16kHz
    const ratio = this.targetRate / inputRate;
    const outputLength = Math.round(channelData.length * ratio);
    const resampled = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i / ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, channelData.length - 1);
      const frac = srcIndex - srcIndexFloor;
      resampled[i] = channelData[srcIndexFloor] * (1 - frac) + channelData[srcIndexCeil] * frac;
    }

    // Append to buffer
    const newBuffer = new Float32Array(this.buffer.length + resampled.length);
    newBuffer.set(this.buffer);
    newBuffer.set(resampled, this.buffer.length);
    this.buffer = newBuffer;

    // Send chunks of 1600 samples (3200 bytes PCM int16)
    while (this.buffer.length >= this.targetSamples) {
      const chunk = this.buffer.subarray(0, this.targetSamples);
      this.buffer = this.buffer.subarray(this.targetSamples);

      // Convert float32 to int16
      const pcm16 = new Int16Array(this.targetSamples);
      for (let i = 0; i < this.targetSamples; i++) {
        const s = Math.max(-1, Math.min(1, chunk[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }

    return true;
  }
}

registerProcessor('mic-processor', MicProcessor);
