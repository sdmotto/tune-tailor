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
          {{ currentSong }}
          {{ trackId }}
          {{ artistId }}
          {{ albumId }}
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

<script setup>
import { ref } from "vue";

const mediaRecorder = ref(null);
const mediaStream = ref(null);
const isRecording = ref(false);
const audioChunks = ref([]);
const currentSong = ref("");
const trackId = ref("");
const artistId = ref("");
const albumId = ref("");

const handleButtonClick = async () => {
  if (!isRecording.value) {
    await startRecording();
  } else {
    await stopRecording();
  }
};

const startRecording = async () => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(mediaStream.value);
    audioChunks.value = [];
    isRecording.value = true;

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });
      const arrayBuffer = await audioBlob.arrayBuffer();
      await identifyAudio(arrayBuffer);

      // Stop and release the microphone stream
      mediaStream.value.getTracks().forEach((track) => track.stop());
      mediaStream.value = null;
    };

    mediaRecorder.value.start();
    console.log("Recording started...");
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
    console.log("Recording stopped.");
  }
};

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
    albumId.value = result.metadata.music[0].external_metadata.spotify.album.id;
    

  } catch (error) {
    console.error("Error identifying audio:", error);
  }
};
</script>

<style>
</style>
