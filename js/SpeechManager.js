export default class SpeechManager {
//class SpeechManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;

        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.speechSynthesis.getVoices();

        if (this.voices.length === 0) {
            this.speechSynthesis.onvoiceschanged = () => {
                this.voices = this.speechSynthesis.getVoices();
                if (this.voices.length > 0) {
                    this.selectedVoice = this.voices[0]; 
                    console.log('Voices loaded:', this.voices);
                }
            };
        } else {
            this.selectedVoice = this.voices[0];
        }
    }

    setSelectedVoice(voice) {
        this.selectedVoice = voice;
        console.log("Selected Voice:", voice);
    }

    setVoiceSettings(rate, pitch) {
        this.currentRate = rate;
        this.currentPitch = pitch;
        console.log(`Voice settings updated: rate=${rate}, pitch=${pitch}`);
    }

    speak(text) {
        if (!text.trim()) {
            console.error("The text for speech is empty.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice || this.voices[0]; 
        utterance.lang = "uk-UA"; 
        utterance.rate = 1;
        utterance.pitch = 1;
        this.speechSynthesis.speak(utterance);
    }

    stopSpeech() {
        this.speechSynthesis.cancel();
    }

    testVoice(rate, pitch) {
        const utterance = new SpeechSynthesisUtterance("Тестовий текст.");
        utterance.voice = this.selectedVoice || this.voices[0];
        utterance.lang = "uk-UA";
        utterance.rate = rate;
        utterance.pitch = pitch;
    
        this.speechSynthesis.speak(utterance);
    }

    getVoices() {
        return this.voices;
    }

    updateVoiceRateAndPitch(rate, pitch) {
        this.selectedVoice.rate = rate;
        this.selectedVoice.pitch = pitch;
    }
}

//module.exports = SpeechManager;
window.SpeechManager = SpeechManager;