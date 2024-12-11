<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-purple-300 relative"
  >
    <!-- Title -->
    <h1
      class="text-5xl mt-8 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-12"
    >
      TuneTailor
    </h1>

    <!-- Play Button -->
    <button
      class="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-4xl flex items-center justify-center shadow-xl hover:scale-105 transform transition-transform duration-300 focus:outline-none"
      @click="handleButtonClick"
    >
      <span v-if="!isRecording">▶</span>
      <span v-else>■</span>
    </button>

    <!-- Two Rows of Three Cards Section -->
    <div
      class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl auto-rows-min"
    >
      <!-- First Row -->
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

      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">New Lyrics:</span>
        <div
          :class="{ 'h-14': !newSong }"
          class="p-4 w-full bg-gray-50 rounded-md shadow-inner text-gray-800 leading-relaxed"
        >
          <div v-if="!generatingLyrics" class="whitespace-pre-wrap text-center">
            <div style="max-height: 342px; overflow-y: auto;">
              {{ newSong }}
            </div>
            <button
              v-if="newSong && !generatingMusic"
              @click="generateSong()"
              class="px-6 py-3 mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none"
            >
              Generate Song
            </button>
            <Loading class="mt-4" v-if="generatingMusic" />
          </div>
          <div v-else class="flex items-center justify-center">
            <Loading />
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">Image:</span>
        <div
          :class="{'h-14' : !imageUrl}"
          class="p-4 w-full bg-gray-50 rounded-md shadow-inner text-gray-800 text-center"
        >
          <Loading class="text-center" v-if="generatingImage" />
          <img
            v-if="imageUrl"
            :src="imageUrl"
            class="w-full h-full object-cover"
            alt="Generated Image"
          />
        </div>
      </div>

      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">Audio:</span>
        <div class="w-full h-14">
          <audio
            ref="audioPlayer"
            class="w-full"
            controls
            v-if="musicData"
          >
            <source :src="musicData" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <loading v-if="generatingMusic" />
        </div>
      </div>

      <div
        class="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md self-start"
      >
        <span class="text-xl font-bold text-gray-700">Attention</span>
        <p class="text-gray-600 h-14">
          For a full composition with lyrics, paste the new song into <strong>Suno</strong>.
        </p>
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

const generatingLyrics = ref(false);
const newSong = ref("");

const generatingImage = ref(false);
const imageUrl = ref("");

const generatingMusic = ref(false);
const audioPlayer = ref(null);
const musicData = ref("");
const binary = ref("");

const handleButtonClick = async () => {
  if (!isRecording.value) {
    await startRecording();
  } else {
    await stopRecording();
  }
};

const startRecording = async () => {
  resetRefs();

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

const identifyAudio = async (audioBuffer) => {
  identifying.value = true;
  try {
    const uint8Array = new Uint8Array(audioBuffer);
    let binaryString = "";
    const chunkSize = 65536;

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
      errorRefs();
    } else {
      currentSong.value = result.metadata.music[0].title;
      artistName.value = result.metadata.music[0].artists[0].name;
      genre.value = result.metadata.music[0].genres[0].name;
      albumName.value = result.metadata.music[0].album.name;

      display.value = `"${currentSong.value}" by ${artistName.value}`;

      getRecommendations();
      generateLyrics();
      generateImage();
    }
  } catch (e) {
    console.error("Error identifying audio:", e);
    errorRefs();
  }

  identifying.value = false;
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

const generateLyrics = async () => {
  generatingLyrics.value = true;
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
    console.error("Error generating lyrics:", e);
  }

  generatingLyrics.value = false;
};

const generateImage = async () => {
  generatingImage.value = true;
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        song: currentSong.value,
        artist: artistName.value,
        album: albumName.value
      }),
    });

    const result = await response.json();
    imageUrl.value = result.image;
    generatingImage.value = false;

    console.log("Image result: ", result);
  } catch (e) {
    console.error("Error generating image:", e);
  }
};

const generateSong = async () => {
  generatingMusic.value = true;
  musicData.value = "";
  try {
    const response = await fetch("/api/generate-song", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songName: newSong.value,
        artist: artistName,
        lyrics: newSong.value
      }),
    });

    const result = await response.json();

    // Decode Base64 string and create Blob
    const binaryString = atob(result.song); // Decode Base64
    const binaryData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      binaryData[i] = binaryString.charCodeAt(i);
    }

    const audioBlob = new Blob([binaryData], { type: "audio/mpeg" });
    musicData.value = URL.createObjectURL(audioBlob);

    if (audioPlayer.value) {
      audioPlayer.value.src = musicData.value;
      audioPlayer.value.load();
    }

    console.log("Song result: ", result);
  } catch (e) {
    console.error("Error generating song:", e);
  }

  generatingMusic.value = false;
}

//helpers
const resetRefs = () => {
  recommendations.value = [];
  display.value = "";
  newSong.value = "";
  imageUrl.value = "";
  musicData.value = "";
}

const errorRefs = () => {
  display.value = "Error identifying song";
  recommendations.value = [];
  newSong.value = "";
  imageUrl.value = "";
  musicData.value = null;
}

</script>

<style></style>
