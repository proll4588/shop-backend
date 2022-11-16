import prisma from '../../controllers/prisma.controller.js'

export const goodSelect = {
    id: true,
    name: true,
    description: true,
    main_photo: true,
    all_photos: true,
    current_price: {
        select: {
            price: true,
            discount: true,
        },
    },
    all_prices: {
        select: {
            price: true,
            discount: true,
        },
    },
    brands: true,
    sub_type_goods: true,
    rating: true,
}

export const cartSelect = {
    id: true,
    count: true,
    goods_catalog: {
        select: goodSelect,
    },
}

/* Получение информации о товаре по его id */
export const getGoodById = async (goodId) => {
    return await prisma.goods_catalog.findUnique({
        where: {
            id: goodId,
        },
        select: goodSelect,
    })
}

/* Получени всех товаров заданного типа */
export const getGoodsByType = async (typeId) => {
    return await prisma.goods_catalog.findMany({
        where: {
            sub_type_goods_id: typeId,
        },
        select: goodSelect,
    })
}

/* Получение товароы заданного типа с заданными фильтрами */
export const getGoodsByFlters = async (filters, typeId) => {
    if (!filters)
        return await prisma.goods_catalog.findMany({
            where: { sub_type_goods_id: typeId },
            select: goodSelect,
        })
    if (filters === null) return []
    return await prisma.goods_catalog.findMany({
        where: {
            /* Поиск по параметрам типа */
            AND: [
                ...filters.typeFilters.map((filter) => {
                    if (filter.state.length === 0) return
                    return {
                        goods_characteristics: {
                            some: {
                                OR: filter.state.map((state) => ({
                                    characteristics_params_id: state,
                                })),
                            },
                        },
                    }
                }),

                /* Поиск по произвадителю */
                {
                    OR: filters.generalFilters.brand.map((brand) => ({
                        brand_id: brand,
                    })),
                },

                /* Поиск по типу */
                { sub_type_goods_id: typeId },

                /* Поиск по цене */
                {
                    OR: {
                        current_price: {
                            price: {
                                gte: filters.generalFilters.price.min
                                    ? filters.generalFilters.price.min
                                    : undefined,
                                lte: filters.generalFilters.price.max
                                    ? filters.generalFilters.price.max
                                    : undefined,
                            },
                        },
                    },
                },
            ],
        },
        select: goodSelect,
    })
}

/* Получение всей иерархии типов товаров */
export const getTypes = async () => {
    return await prisma.global_type_goods.findMany({
        include: {
            local_type_goods: {
                include: {
                    sub_type_goods: true,
                },
            },
        },
    })
}

/* Получение всех избранных товаров пользователя */
export const getFavoriteGoods = async (userId) => {
    return await prisma.goods_catalog.findMany({
        where: {
            favorite_goods: {
                some: {
                    users_id: userId,
                },
            },
        },
        select: goodSelect,
    })
}

/* Добавление товара в избранное пользователя */
export const addGoodToFavorite = async (userId, goodId) => {
    /* Смотрим наличие этого товара в избранном */
    const condidat = await prisma.favorite_goods.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    /* Если такой товар уже есть, то кидаем исключение */
    if (condidat) throw 'GOOD_ALREADY_EXIST'

    /* Добаляем товар в избранное */
    await prisma.favorite_goods.create({
        data: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    // TODO: можно возвращать только новый элемент. На стороне клиента добавлять в кэш
    /* Выводим новый список избранного */
    return await prisma.favorite_goods.findMany({
        where: {
            users_id: userId,
        },
    })
}

/* Удаление товара из избранного пользователя */
export const removeGoodFromFavorite = async (userId, goodId) => {
    /* Получаем объект для удаления */
    const candidat = await prisma.favorite_goods.findFirst({
        where: {
            goods_catalog_id: goodId,
            users_id: userId,
        },
    })

    /* Если такого товара нет, то кидаем ошибку */
    if (!candidat) throw 'GOOD_NOT_FOUND'

    /* Удаляем объект */
    await prisma.favorite_goods.delete({
        where: {
            id: candidat.id,
        },
    })

    // TODO: можно ничего не возвращать. На стороне клиента удалят элемент из кэш
    /* Выводим новый список избранного */
    return await prisma.favorite_goods.findMany({
        where: {
            users_id: userId,
        },
    })
}

/* Получение товароы в корзине */
export const getGoodsInCart = async (userId) => {
    return await prisma.cart.findMany({
        where: {
            users_id: userId,
        },
        select: cartSelect,
    })
}

/* Добавление товара в корзину пользователя */
export const addGoodToCart = async (userId, goodId, count) => {
    /* Проверяем наличие данного товара в корзине */
    const candidat = await prisma.cart.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    /* Если товар в корзине уже есть, то кидаем ошибку */
    if (candidat) throw 'GOOD_ALREADY_EXIST'

    /* Создаём новую запись в таблице (добаляем товар в карщину) */
    await prisma.cart.create({
        data: {
            users_id: userId,
            goods_catalog_id: goodId,
            count: count,
        },
    })

    /* Возвращаем список товаров в корзине */
    return await prisma.cart.findMany({
        where: {
            users_id: userId,
        },
        select: cartSelect,
    })
}

/* Удаление товара из карзины пользователя */
export const removeGoodFromCart = async (userId, goodId) => {
    /* Находим нужную запись для удаления */
    const candidat = await prisma.cart.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    /* Проверяем наёдена ли запись */
    if (!candidat) throw 'GOOD_NOT_FOUND'

    /* Удяляем запись */
    await prisma.cart.delete({
        where: {
            id: candidat.id,
        },
    })

    /* Возвращаем новый список товаров корзины */
    return await prisma.cart.findMany({
        where: {
            users_id: userId,
        },
        select: cartSelect,
    })
}

/* Изменение кол-во товара к карзине */
export const changeGoodCountInCart = async (userId, goodId, count) => {
    /* Находим запись для изменения */
    const candidat = await prisma.cart.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    /* Проверяем наличие записи */
    if (!candidat) throw 'GOOD_NOT_FOUND'

    /* Обновляем запись */
    await prisma.cart.update({
        where: {
            id: candidat.id,
        },
        data: {
            count: count,
        },
    })

    /* Возвращаем обновлённый список товаров корзины */
    return await prisma.cart.findMany({
        where: {
            users_id: userId,
        },
        select: cartSelect,
    })
}

/* Подсчёт кол-ва избранных товаров */
export const getFavoriteCount = async (userId) => {
    return await prisma.favorite_goods.count({
        where: {
            users_id: userId,
        },
    })
}

/* Подсчёт кол-ва товаров в карзине */
export const getCartCount = async (userId) => {
    return await prisma.cart.count({
        where: {
            users_id: userId,
        },
    })
}
