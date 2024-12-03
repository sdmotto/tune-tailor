<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-blue-700 mb-8">TuneTailor</h1>

    <!-- Big Button -->
    <button
      class="w-24 h-24 bg-blue-500 rounded-full text-white text-4xl flex items-center justify-center shadow-lg hover:bg-blue-600 focus:outline-none"
      @click="handleButtonClick"
    >
      ▶
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
  methods: {
    handleButtonClick() {
      // TODO: Add functionality here
      console.log("Big button clicked");
    },
  },
};
</script>

<style>
/* Add any custom styles here */
</style>
