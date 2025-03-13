<template>
    <header class="text-gray-600">
        <div class="container mx-auto flex flex-nowrap p-2 flex-col md:flex-row justify-between items-center">
            <!--Logo-->
            <a href="/" class="flex items-center md:mb-0">
                <Logo />
            </a>
            <!--Buscador-->
            <div class="">
                <div class="header__search">
				    <div class="search-box-cmp flex flex-row items-center">
                        <Icon name="tabler:search" style="color: #888888" size="2em" class="mr-3"/>
                        <div class="search-box">
                            <input class="search-box__input" id="e_busqueda" name="e_busqueda" data-tienda-id="1" type="text" placeholder="Buscar" autocomplete="off" value="">
                            <div id="search-box-cancel-btn" class="search-box__btn search-box__btn--cancel search-box__btn--hidden"></div>
                        </div>
                    </div>			
                </div>
            </div>
            <!--Main Menú-->
            <div class="">
                
                <nav class="">
                <a class="mr-5 hover:text-gray-900" href="tel:+34932749890">
                    
                        <Icon name="tabler:phone-call" style="color: #888888" size="2rem" class="mr-0" /> 

                    +34 93 274 98 90
                </a>

                <a href="" class="mr-5 hover:text-gray-900">Contacto</a>
                <a href="" class="mr-5 hover:text-gray-900">Novedades</a>
                <a href="" class="mr-5 hover:text-gray-900">Blog</a>
            </nav>
            </div>
            
            
        </div>
    </header>
</template>
<script setup>
import Logo from './Logo.vue';
</script>

<style>
.header__search {
    margin: 0 40px;
    width: 100%;
}
.search-box {
    border: 1px #666666 solid;
}
.search-box--result {
    border-radius: 2px 2px 0 0
}

.search-box__input {
    border: none;
    border-radius: 2px 0 0 2px;
    height: 36px;
    margin: 0;
    padding-left: 10px;
    padding-right: 48px;
    width: 100%
}

.search-box__btn {
    align-items: center;
    border-radius: 0 2px 2px 0;
    color: #333;
    display: flex;
    height: 36px;
    padding: 0 8px 0 0
}

.search-box__btn:hover {
    color: #040404;
    cursor: pointer
}

.search-box--focus .search-box__btn {
    color: #040404
}

.search-box__btn:before {
    content: "\e848";
    font-family: hkr;
    font-size: 24px
}

.search-box__btn--search-opener:before {
    color: #040404
}



.search-box__btn--hidden {
    display: none
}

.search-box__result {
    display: none;
    max-width: 100%;
    position: relative
}
</style>