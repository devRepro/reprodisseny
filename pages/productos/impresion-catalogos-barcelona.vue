<script setup lang="ts">
import EditorialLanding from '~/components/marketing/landing/EditorialLanding.vue';
import { editorialLandings } from '~/shared/data/editorialLandings';
</script>

<template>
  <EditorialLanding publication="catalogos" :content="editorialLandings.catalogos" />
</template>
