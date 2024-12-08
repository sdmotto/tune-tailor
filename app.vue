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
        <div
          class="p-4 h-12 w-full bg-white rounded-lg shadow-md flex items-center justify-center text-black"
        >
          <div v-if="!identifying">
            {{ display }}
          </div>
          <Loading v-else />
        </div>
      </div>

      <!-- Recommendations Column -->

      <div class="flex flex-col items-center space-y-4 mb-8">
        <span class="text-xl font-bold">Recommendations:</span>
        <div class="flex flex-col w-full space-y-4">
          <!-- Placeholder when no recommendations are available -->
          <div
            v-if="recommendations.length === 0"
            class="p-4 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500"
          >
            <Loading v-if="recommending" />
          </div>
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
        <span class="text-xl font-bold">New Song:</span>
        <div
          class="p-4 h-12 w-full bg-white rounded-lg shadow-md flex items-center justify-center text-black"
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

const identifying = ref(false);
const artistName = ref("");
const albumName = ref("");
const currentSong = ref("");
const genre = ref("");
const display = ref("");

const recommending = ref(false);
const recommendations = ref([]);

const handleButtonClick = async () => {
  if (!isRecording.value) {
    await startRecording();
  } else {
    await stopRecording();
  }
};

const startRecording = async () => {
  recommendations.value = [];
  display.value = "";

  try {
    // Stop any existing recording to prevent conflicts
    if (mediaRecorder.value && isRecording.value) {
      stopRecording();
    }

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
      if (audioChunks.value.length > 0) {
        const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });
        const arrayBuffer = await audioBlob.arrayBuffer();

        try {
          await identifyAudio(arrayBuffer);
        } catch (error) {
          console.error("Error processing audio identification:", error);
        }
      }

      // Stop and release the microphone stream safely
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach((track) => track.stop());
        mediaStream.value = null;
      }
    };

    mediaRecorder.value.start();
    console.log("Recording started...");
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    isRecording.value = false;
    mediaRecorder.value.stop();
    console.log("Recording stopped.");
  }
};

const getRecommendations = async () => {
  recommending.value = true;
  recommendations.value = [];

  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentSong: currentSong.value,
        artist: artistName.value,
        genre: genre.value,
        albumTitle: albumName.value
      }),
    });

    const result = await response.json();

    console.log("Recommendations result:", result);

    recommendations.value = result.recommendations.map(entry => `${entry.song} by ${entry.artist}`);
  } catch (e) {
    console.error("Error fetching recommendations:", e);
  }

  recommending.value = false;
};

const identifyAudio = async (audioBuffer) => {
  identifying.value = true;
  try {
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = "";
    const chunkSize = 65536; // 64 KB chunks

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binaryString += String.fromCharCode.apply(
        null,
        uint8Array.slice(i, i + chunkSize)
      );
    }

    const audioBase64 = btoa(binaryString);

    const response = await fetch("/api/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audioBuffer: audioBase64 }),
    });

    const result = await response.json();
    console.log("ACRCloud result:", result);

    if (result.status.code === 1001) {
      display.value = "Error identifying song";
      recommendations.value = ['No recommendations'];
    } else {
      currentSong.value = result.metadata.music[0].title;
      artistName.value = result.metadata.music[0].artists[0].name;
      genre.value = result.metadata.music[0].genres[0].name;
      albumName.value = result.metadata.music[0].album.name;

      display.value = `${currentSong.value} by ${artistName.value}`

      identifying.value = false;
      await getRecommendations();
    }
    
  } catch (error) {
    console.error("Error identifying audio:", error);
    display.value = "Error identifying song";
    recommendations.value = ['No recommendations'];
  }
};

// Debug function
const debugRecommendations = () => {
  currentSong.value = "good 4 u";
  artistName.value = "Olivia Rodrigo";
  albumName.value = "SOUR";
  genre.value = "";

  getRecommendations();
};
</script>

<style></style>
