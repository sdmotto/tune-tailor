<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-blue-700 mb-8">TuneTailor</h1>

    <!-- Dynamic Button -->
    <button
      class="w-24 h-24 bg-blue-500 rounded-full text-white text-4xl flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none"
      @click="handleButtonClick"
    >
      <span v-if="!isRecording">▶</span>
      <span v-else>■</span>
    </button>

    <!-- Three Columns Section -->
    <div class="mt-10 flex w-full justify-around px-10">
      <!-- Currently Playing Column -->
      <div class="flex flex-col items-center space-y-4">
        <span class="text-xl font-bold">Currently Playing:</span>
        <div class="w-64 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          current song
        </div>
      </div>

      <!-- Recommendations Column -->
      <div class="flex flex-col items-center space-y-4">
        <span class="text-xl font-bold">Recommendations:</span>
        <div class="w-64 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          rec 1
        </div>
      </div>

      <!-- New Song Column -->
      <div class="flex flex-col items-center space-y-4">
        <span class="text-xl font-bold">New Song:</span>
        <div class="w-64 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          title of new song here
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mediaRecorder: null,
      audioChunks: [],
      isRecording: false, // Track recording state
    };
  },
  methods: {
    async handleButtonClick() {
      // Toggle recording state
      if (!this.isRecording) {
        await this.startRecording();
      } else {
        await this.stopRecording();
      }
    },
    async startRecording() {
      try {
        // Request access to microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.isRecording = true; // Update state to reflect recording started

        // Collect audio chunks
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        // Handle stopping and process audio
        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const arrayBuffer = await audioBlob.arrayBuffer();
          this.identifyAudio(arrayBuffer);
        };

        // Start recording
        this.mediaRecorder.start();
        console.log("Recording started...");
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    },
    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.isRecording = false; // Update state to reflect recording stopped
        console.log("Recording stopped.");
      }
    },
    async identifyAudio(audioBuffer) {
      try {
        const response = await fetch("/api/identify", {
          method: "POST", // Use POST for sending audio data
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioBuffer }),
        });
        const result = await response.json();
        console.log("AcrCloud result:", result);
      } catch (error) {
        console.error("Error identifying audio:", error);
      }
    },
  },
};
</script>

<style>
</style>