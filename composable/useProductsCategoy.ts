import { useAsyncData } from 'nuxt/app';
import type { Producto } from '../types/producto'; 

export const useProductsCategory = async ( slug:string ): Promise<Producto[]> => {
    return await queryContent(`/categorias/${slug}`)
    .where({_file: { $ne: 'index.md'}})
    .only(['title', 'slug', 'image', 'alt']) // ajusta los campos que necesites
    .find()
}