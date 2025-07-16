<template>
  <section
    class="w-full py-16 px-4 bg-gradient-to-br from-primary/90 to-secondary/90 text-white relative overflow-hidden"
  >
    <div
      class="max-w-5xl mx-auto rounded-lg bg-background shadow-md border border-primary/20 text-center px-6 py-12 md:px-12 relative z-10"
    >
      <h2 class="text-3xl md:text-4xl font-bold mb-4 text-primary">
        ¿Listo para imprimir tus ideas?
      </h2>
      <p class="text-lg md:text-xl mb-6 text-foreground">
        Solicita tu presupuesto personalizado en menos de 24 horas.
      </p>
      <Button as-child class="btn-primary text-base px-6 py-3 rounded-lg">
        <NuxtLink to="/contacto">Solicitar presupuesto</NuxtLink>
      </Button>
    </div>
    <div id="cursor-glow" class="absolute rounded-full pointer-events-none transition-transform duration-150 ease-out" :style="cursorGlowStyle"></div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';

const cursorGlow = ref(null);
const cursorGlowStyle = ref({});

onMounted(() => {
  cursorGlow.value = document.getElementById('cursor-glow');
  if (cursorGlow.value) {
    document.addEventListener('mousemove', (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      cursorGlowStyle.value = {
        left: `${x}px`,
        top: `${y}px`,
        width: '80px',
        height: '80px',
        transform: 'translate(-50%, -50%) scale(1)',
        background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 10%, transparent 70%)', // Azul claro
        zIndex: 5,
      };
    });

    document.addEventListener('mouseleave', () => {
      cursorGlowStyle.value = {
        transform: 'translate(-50%, -50%) scale(0)',
      };
    });
  }
});
</script>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* Ajusta el espacio entre elementos si es necesario */
  padding: 0.75rem 1.5rem; /* Corresponde a py-3 px-6 */
  font-size: 0.875rem; /* Corresponde a text-base */
  font-weight: 500; /* Corresponde a font-medium (asumiendo que es el peso para semibold) */
  border-radius: 0.5rem; /* Corresponde a rounded-lg */
  transition-property: color, background-color, border-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms; /* Corresponde a duration-200 */
  background-color: hsl(var(--color-primary));
  color: hsl(var(--primary-foreground));
}

.btn-primary:hover {
  filter: brightness(0.95); /* Simula hover:bg-primary-dark */
}

#cursor-glow {
  width: 0;
  height: 0;
  background: transparent;
}
</style>