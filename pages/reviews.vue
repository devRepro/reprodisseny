<!-- pages/index.vue -->
<template>
  <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 p-8">
    <ReviewsGoogleReviewCard
      v-for="review in reviews"
      :key="review.reviewId"
      :review="review"
    />
  </div>
</template>

<script setup lang="ts">

const { data: reviews } = useGoogleReviews()
</script>
