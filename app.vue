<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-purple-300"
  >
    <!-- Title -->
    <h1
      class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-12"
    >
      TuneTailor
    </h1>

    <!-- Dynamic Button -->
    <button
      class="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-4xl flex items-center justify-center shadow-xl hover:scale-105 transform transition-transform duration-300 focus:outline-none"
      @click="handleButtonClick"
    >
      <span v-if="!isRecording">▶</span>
      <span v-else>■</span>
    </button>

    <!-- Debug Button -->
    <button
      class="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none"
      @click="debugRecommendations"
    >
      Debug Recommendations
    </button>

    <!-- Three Columns Section -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      <!-- Currently Playing Column -->
      <div class="flex flex-col items-center space-y-4">
        <span class="text-xl font-bold">Currently Playing:</span>
        <div class="w-64 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700">
          {{ currentSong }}
        </div>
      </div>

      <!-- Recommendations Column -->

      <div class="flex flex-col items-center space-y-4 mb-8">
        <span class="text-xl font-semibold text-gray-800"
          >Recommendations:</span
        >
        <div class="flex flex-col w-full space-y-4">
          <!-- Placeholder when no recommendations are available -->
          <div
            v-if="recommendations.length === 0"
            class="p-4 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500"
          ></div>
          <!-- Render recommendations when available -->
          <div
            v-for="(recommendation, index) in recommendations"
            :key="index"
            class="flex items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-shadow duration-300"
          >
            <!-- Icon -->
            <div
              class="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold mr-4"
            >
              {{ index + 1 }}
            </div>
            <!-- Recommendation Text -->
            <div class="flex-1 text-gray-800 font-medium">
              {{ recommendation }}
            </div>
          </div>
        </div>
      </div>

      <!-- New Song Column -->
      <div class="flex flex-col items-center space-y-4">
        <span class="text-xl font-semibold text-gray-800">New Song:</span>
        <div
          class="w-full h-12 bg-white rounded-xl flex items-center justify-center text-gray-700 shadow-md"
        >
          Title of new song here
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
const trackName = ref("");
const artistName = ref("");
const albumName = ref("");
const genre = ref("");
const recommendations = ref([]); // Store recommendations

const handleButtonClick = async () => {
  if (!isRecording.value) {
    await startRecording();
  } else {
    await stopRecording();
  }
};

const startRecording = async () => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
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

const getRecommendations = async (customTrackId = trackId.value, customArtistId = artistId.value, customGenre = genre.value) => {
  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentSong: customTrackId, artist: customArtistId, album: customGenre }),
    });

    const result = await response.json();

    console.log("Recommendations result:", result);

    // Parse response and split by commas
    recommendations.value = (result.recommendations || "")
      .split(",") // Split by commas
      .map((item) => item.trim()); // Trim whitespace
  } catch (e) {
    console.error("Error fetching recommendations:", e);
  }
};

const identifyAudio = async (audioBuffer) => {
  try {
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer)),
    );
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
    albumName.value = result.metadata.music[0].external_metadata.spotify.album.name;


    getRecommendations();
  } catch (error) {
    console.error("Error identifying audio:", error);
  }
};

// Debug function
const debugRecommendations = () => {
  getRecommendations("good 4 u", "Olivia Rodrigo", "SOUR");
};
</script>

<style></style>
