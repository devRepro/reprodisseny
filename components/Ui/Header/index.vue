<template>
    <header class="text-gray-600">
        <div class="container mx-auto flex flex-nowrap p-2 flex-col md:flex-row justify-between items-center">
            <!--Logo-->
            <a href="/" class="flex items-center md:mb-0">
                <UiLogo />
            </a>
            <!--Buscador-->

            <div class="flex flex-row items-center">
                <Icon name="tabler:search" style="color: #888888" size="2rem" class="mr-2" />
                <input type="text" placeholder=""
                    class="w-80 p-2 bg-white text-gray-700 rounded-lg border-2 border-gray-400 focus:border-[#1A78B3] outline-none placeholder-gray-500" />

            </div>

            <!--Main Menú-->

            <!--
            ****************************************************************************
            TODO: Menu para movil
            ****************************************************************************
            -->
            <div>
                <nav class="flex items-center space-x-5">
                    <a class="flex items-center hover:text-gray-900" href="tel:+34932749890">
                        <Icon name="tabler:phone-call" style="color: #888888" size="2rem" class="mr-2" />
                        <span>+34 93 274 98 90</span>
                    </a>
                    <a href="/contacto" class="hover:text-gray-900">Contacto</a>
                    <a href="/novedades" class="hover:text-gray-900">Novedades</a>
                    <a href="/blog" class="hover:text-gray-900">Blog</a>
                </nav>
            </div>
          
        </div>
    </header>
</template>
<script setup>
    
</script>

<style></style>