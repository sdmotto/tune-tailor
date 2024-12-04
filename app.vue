<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-blue-700 mb-6 text-center">TuneTailor</h1>
    {{ isRecording }}
    {{ error }}
    <button @click="error=[]" class="border">Clear</button>
    <button @click="error.push('what the flip')">ermm</button>

    <!-- Dynamic Button -->
    <button
      class="w-20 h-20 bg-blue-500 rounded-full text-white text-4xl flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none"
      @click="handleButtonClick"
    >
      <span v-if="!isRecording">▶</span>
      <span v-else>■</span>
    </button>

    <!-- Three Sections -->
    <div class="mt-8 flex flex-col sm:flex-row sm:justify-around w-full max-w-2xl px-4 space-y-6 sm:space-y-0 sm:space-x-4">
      <!-- Currently Playing Column -->
      <div class="flex flex-col items-center space-y-2">
        <span class="text-lg font-bold">Currently Playing:</span>
        <div class="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          {{ currentSong }}
        </div>
      </div>

      <!-- Recommendations Column -->
      <div class="flex flex-col items-center space-y-2">
        <span class="text-lg font-bold">Recommendations:</span>
        <div class="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          rec 1
        </div>
      </div>

      <!-- New Song Column -->
      <div class="flex flex-col items-center space-y-2">
        <span class="text-lg font-bold">New Song:</span>
        <div class="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          title of new song here
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const mediaRecorder = ref(null);
const mediaStream = ref(null);
const isRecording = ref(false);
const audioChunks = ref([]);
const currentSong = ref("");
const trackId = ref("");
const artistId = ref("");
const genre = ref("");
const error = ref([]);

const handleButtonClick = async () => {
  error.value.push('what');

  if (!isRecording.value) {
    await startRecording();
  } else {
    await stopRecording();
  }
};

const startRecording = async () => {
  try {
    console.log("Requesting microphone access...");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      error.value.push("getUserMedia is not supported on this device.");
      return;
    }

    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("MediaStream obtained:", mediaStream.value);

    if (!window.MediaRecorder) {
      error.value.push("MediaRecorder is not supported on this device.");
      return;
    }

    mediaRecorder.value = new MediaRecorder(mediaStream.value);
    console.log("MediaRecorder initialized:", mediaRecorder.value);

    audioChunks.value = [];
    isRecording.value = true;

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });
      const arrayBuffer = await audioBlob.arrayBuffer();
      console.log("Recording stopped, processing audio...");
      await identifyAudio(arrayBuffer);

      // Stop and release the microphone stream
      mediaStream.value.getTracks().forEach((track) => track.stop());
      mediaStream.value = null;
    };

    mediaRecorder.value.start();
    console.log("Recording started...");
  } catch (err) {
    error.value.push(err);
    console.error("Error accessing microphone:", err);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    console.log("Recording stopped.");
  }
};

const getRecommendations = async () => {
  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ artistId: artistId.value, trackId: trackId.value, genre: genre.value }),
    });

    const result = await response.json();

    console.log(result);
  } catch (e) {
    error.value.push(e);
  }
}

const identifyAudio = async (audioBuffer) => {
  try {
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const response = await fetch("/api/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audioBuffer: audioBase64 }),
    });

    const result = await response.json();
    console.log("ACRCloud result:", result);
    // Update UI with identified data
    currentSong.value = result.metadata.music[0].title;
    trackId.value = result.metadata.music[0].external_metadata.spotify.track.id;
    artistId.value = result.metadata.music[0].external_metadata.spotify.artists[0].id;
    genre.value = result.metadata.music[0].genres[0].name;
    

    //getRecommendations();

  } catch (error) {
    error.value.push(error);
    console.error("Error identifying audio:", error);
  }
};
</script>

<style>
</style>
