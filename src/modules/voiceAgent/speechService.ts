// Browser Web Speech API & Synthesis wrapper with fallback simulation

export class BrowserSpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (this.onTranscriptCallback) {
            if (finalTranscript) {
              this.onTranscriptCallback(finalTranscript, true);
            } else if (interimTranscript) {
              this.onTranscriptCallback(interimTranscript, false);
            }
          }
        };

        this.recognition.onerror = (event: any) => {
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      }

      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) return false;
    this.onTranscriptCallback = onTranscript;
    if (onError) this.onErrorCallback = onError;

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      console.warn('Speech recognition already started or blocked', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string, lang = 'en-US', onEnd?: () => void): void {
    if (!this.synthesis) {
      if (onEnd) setTimeout(onEnd, 1000);
      return;
    }

    // Cancel ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = this.synthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural')));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechServiceInstance = new BrowserSpeechService();
