<template>
    <div class="loading-container">
      <div class="spinner"></div>
      <p class="loading-message">Loading...</p>
    </div>
  </template>
  
  <script setup>
 
  </script>
  
  <style scoped>
  .loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px; /* Space between spinner and text */
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #000;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1rem;
  color: #000;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
  </style>
  