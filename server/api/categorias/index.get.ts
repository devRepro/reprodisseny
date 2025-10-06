export default eventHandler(async (event) => {
  return await queryCollectionNavigation(
    event,
    'categorias',
    ['slug','title','nav','order','image','description','featured','hidden','path']
  ).where('hidden', '=', false)
   .order('order', 'ASC')
})
