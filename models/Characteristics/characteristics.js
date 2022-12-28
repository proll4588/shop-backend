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

export const getCharacteristicGroupsByGoodId = async (
    goodId,
    search,
    skip = 0,
    take = 10
) => {
    const good = await prisma.goods_catalog.findUnique({
        where: {
            id: goodId,
        },
        select: {
            sub_type_goods_id: true,
        },
    })
    const subId = good.sub_type_goods_id
    // console.log(subId)

    return await prisma.characteristics_groups.findMany({
        where: {
            name: {
                contains: search || '',
            },
            characteristics_by_goods_types: {
                some: {
                    sub_type_goods_id: {
                        equals: subId,
                    },
                },
            },
        },
        skip,
        take,
    })
}

export const addCharacteristicGroup = async (subId, name) => {
    const group = await prisma.characteristics_groups.create({
        data: {
            name: name,
        },
    })

    await prisma.characteristics_by_goods_types.create({
        data: {
            characteristics_groups_id: group.id,
            sub_type_goods_id: subId,
        },
    })

    return group
}

export const getCharacteristicList = async (
    groupId,
    search,
    skip = 0,
    take = 10
) => {
    return await prisma.characteristics_list.findMany({
        where: {
            characteristics_groups_id: groupId,
            name: {
                contains: search || '',
            },
        },
        skip,
        take,
    })
}

export const addCharacteristicList = async (groupId, name) => {
    return await prisma.characteristics_list.create({
        data: {
            characteristics_groups_id: groupId,
            name,
        },
    })
}

export const getCharacteristicValues = async (
    listId,
    search,
    skip = 0,
    take = 10
) => {
    return await prisma.characteristics_params.findMany({
        where: {
            characteristics_list_id: listId,
            value: {
                contains: search || '',
            },
        },
        skip,
        take,
    })
}

export const addCharacteristicValue = async (listId, value) => {
    return await prisma.characteristics_params.create({
        data: {
            characteristics_list_id: listId,
            value: value,
        },
    })
}

export const addCharacteristicToGood = async (goodId, listId, valueId) => {
    return await prisma.goods_characteristics.create({
        data: {
            characteristics_list_id: listId,
            characteristics_params_id: valueId,
            goods_catalog_id: goodId,
        },
    })
}

export const deleteGoodCharacteristic = async (goodId, itemId) => {
    const del = await prisma.goods_characteristics.deleteMany({
        where: {
            characteristics_list_id: itemId,
            goods_catalog_id: goodId,
        },
    })

    return del.id
}
