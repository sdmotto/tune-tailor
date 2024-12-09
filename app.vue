<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-purple-300"
  >
    <!-- Title -->
    <h1
      class="text-5xl mt-8 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-12"
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

    <!-- Debug Buttons -->
    <div class="flex space-x-4 mt-6">
      <button
        class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none"
        @click="debugRecommendations"
      >
        Debug Recommendations
      </button>
      <button
        class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none"
        @click="debugLyrics"
      >
        Debug Lyrics
      </button>
    </div>

    <!-- Three Columns Section -->
    <div
      class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl auto-rows-auto"
    >
      <!-- Currently Playing Column -->
      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">Currently Playing:</span>
        <div
          class="p-4 h-14 w-full bg-gray-50 rounded-md shadow-inner text-gray-800 text-center"
        >
          <div v-if="!identifying">{{ display }}</div>
          <Loading v-else />
        </div>
      </div>

      <!-- Recommendations Column -->
      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">Recommendations:</span>
        <div class="flex flex-col w-full space-y-4">
          <div
            v-if="recommendations.length === 0"
            class="p-4 h-14 bg-gray-50 rounded-md shadow-inner text-gray-800 text-center"
          >
            <Loading v-if="recommending" />
          </div>
          <div
            v-for="(recommendation, index) in recommendations"
            :key="index"
            class="flex items-center p-4 bg-gray-50 rounded-md shadow-inner hover:shadow-lg transform transition-shadow duration-300"
          >
            <div
              class="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold mr-4"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 font-medium text-gray-800">
              {{ recommendation }}
            </div>
          </div>
        </div>
      </div>

      <!-- New Song Column -->
      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">New Song:</span>
        <div
          :class="{ 'h-14': !newSong }"
          class="p-4 w-full bg-gray-50 rounded-md shadow-inner text-gray-800 leading-relaxed"
        >
          <div v-if="!generatingSong" class="whitespace-pre-wrap text-center">
            <div>
              {{ newSong }}
            </div>
            <button
              v-if="newSong && newSong !== 'Error generating new song'"
              class="px-6 py-3 mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none"
            >
              Generate Song
            </button>
          </div>
          <div v-else class="flex items-center justify-center">
            <Loading />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-5" />
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

const generatingSong = ref(false);
const newSong = ref("");

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
  newSong.value = "";

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
        albumTitle: albumName.value,
      }),
    });

    const result = await response.json();

    console.log("Recommendations result:", result);

    recommendations.value = result.recommendations.map(
      (entry) => `${entry.song} by ${entry.artist}`,
    );
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
        uint8Array.slice(i, i + chunkSize),
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

    if (result.status.code !== 0) {
      display.value = "Error identifying song";
      recommendations.value = ["No recommendations"];
      newSong.value = "Error generating new song";
    } else {
      currentSong.value = result.metadata.music[0].title;
      artistName.value = result.metadata.music[0].artists[0].name;
      genre.value = result.metadata.music[0].genres[0].name;
      albumName.value = result.metadata.music[0].album.name;

      display.value = `"${currentSong.value}" by ${artistName.value}`;

      getRecommendations();
      generateLyrics();
    }
  } catch (error) {
    console.error("Error identifying audio:", error);
    display.value = "Error identifying song";
    recommendations.value = ["No recommendations"];
    newSong.value = "Error generating new song";
  }

  identifying.value = false;
};

const generateLyrics = async () => {
  generatingSong.value = true;
  try {
    const response = await fetch("/api/generate-lyrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        song: currentSong.value,
        artist: artistName.value,
      }),
    });

    const result = await response.json();

    console.log("Lyrics result: ", result);
    newSong.value = result.song;
  } catch (e) {
    newSong.value = "Error generating lyrics";
  }

  generatingSong.value = false;
};

// Debug functions
const debugRecommendations = () => {
  currentSong.value = "good 4 u";
  artistName.value = "Olivia Rodrigo";
  albumName.value = "SOUR";
  genre.value = "";
  display.value = `"${currentSong.value}" by ${artistName.value}`;

  getRecommendations();
};

const debugLyrics = () => {
  currentSong.value = "good 4 u";
  artistName.value = "Olivia Rodrigo";
  display.value = `"${currentSong.value}" by ${artistName.value}`;

  generateLyrics();
};
</script>

<style></style>
