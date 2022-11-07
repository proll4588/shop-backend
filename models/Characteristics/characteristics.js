import prisma from '../../controllers/prisma.controller.js'

/* Получение характеристик товара по его id */
export const getGoodCharacteristics = async (goodId) => {
    const ans = await prisma.characteristics_groups.findMany({
        include: {
            characteristics_list: {
                include: {
                    goods_characteristics: {
                        where: {
                            goods_catalog_id: goodId,
                        },
                        include: {
                            characteristics_params: true,
                        },
                    },
                },
            },
        },
    })

    // TODO: Мб пенести в control
    return (
        ans
            // Преобразуем данные в нужный формат
            .map((group) => ({
                id: group.id,
                name: group.name,
                items: group.characteristics_list.map((item) => ({
                    id: item.id,
                    name: item.name,
                    value:
                        item.goods_characteristics.length !== 0
                            ? item.goods_characteristics[0]
                                  .characteristics_params.value
                            : null,
                    description: item.description,
                })),
            }))
            // Фильтруем данный
            .map((group) => {
                return {
                    ...group,
                    // Оставляем только те параметры у которых есть значения
                    items: group.items.filter((item) => item.value !== null),
                }
            })
            // Оставляем только те группы у которых есть заданные параметры
            .filter((group) => group.items.length !== 0)
    )
}
