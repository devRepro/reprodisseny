<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <header class="py-4 shadow-md">
      <Header />
    </header>

    <!-- Main Content Layout -->
    <main class="flex-1 container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
     <Footer />
  </div>
</template>
<script setup>
  import Header from '@/components/ui/Header.vue';
  import Footer from '@/components/ui/Footer.vue';
</script>


