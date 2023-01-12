import prisma from '../../controllers/prisma.controller.js'

const isNumeric = (n) => !isNaN(n)

export const goodSelect = {
    id: true,
    name: true,
    description: true,
    main_photo: true,
    all_photos: true,
    current_price: {
        select: {
            id: true,
            date: true,
            price: true,
            discount: true,
        },
    },
    all_prices: {
        select: {
            id: true,
            date: true,
            price: true,
            discount: true,
        },
    },
    brands: true,
    sub_type_goods: true,
    avg_rating: {
        select: {
            count: true,
            avg: true,
        },
    },
    storage: {
        select: {
            count: true,
        },
    },
}

export const cartSelect = {
    id: true,
    count: true,
    goods_catalog: {
        select: goodSelect,
    },
}

export const filteredSearch = (filters, typeId) => {
    return {
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
    }
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
export const getGoodsByFlters = async (
    filters,
    typeId,
    skip = 0,
    take = 10,
    sort = 0
) => {
    let goods
    if (!filters)
        goods = await prisma.goods_catalog.findMany({
            where: { sub_type_goods_id: typeId },
            orderBy: {
                current_price: {
                    price: sort === 0 || sort === 1 ? 'asc' : 'desc',
                },
            },
            select: goodSelect,
            skip,
            take,
        })
    else {
        if (filters === null) return { goods: [], totalCount: 0 }
        goods = await prisma.goods_catalog.findMany({
            where: filteredSearch(filters, typeId),
            orderBy: {
                current_price: {
                    price: sort === 0 || sort === 1 ? 'asc' : 'desc',
                },
            },
            select: goodSelect,
            skip,
            take,
        })
    }

    return { goods, totalCount: countGoodsByFlters(filters, typeId) }
}

export const countGoodsByFlters = async (filters, typeId) => {
    let data
    if (filters === null) return 0
    if (!filters)
        data = await prisma.goods_catalog.aggregate({
            where: { sub_type_goods_id: typeId },
            _count: true,
        })
    else
        data = await prisma.goods_catalog.aggregate({
            where: filteredSearch(filters, typeId),
            _count: true,
        })

    return data._count
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

/* Получение всех отзывов о товаре */
export const getGoodRating = async (goodId) => {
    return await prisma.rating.findMany({
        where: {
            goods_catalog_id: goodId,
        },
        include: {
            users: {
                select: {
                    id: true,
                    fname: true,
                    lname: true,
                    photo: true,
                },
            },
        },
    })
}

/* Создание нового отзыва */
export const createGoodRating = async (userId, goodId, rating, text) => {
    const candidate = await prisma.rating.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    if (candidate) throw 'GOOD_ALREADY_EXIST'

    const now = new Date()
    return await prisma.rating.create({
        data: {
            date: now,
            rating: rating,
            users_id: userId,
            goods_catalog_id: goodId,
            text: text,
        },
        include: {
            users: {
                select: {
                    id: true,
                    fname: true,
                    lname: true,
                    photo: true,
                },
            },
        },
    })
}

/* Удаление отзыва о товаре */
export const deleteGoodRating = async (userId, goodId) => {
    const candidat = await prisma.rating.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    if (!candidat) throw 'GOOD_NOT_FOUND'

    return await prisma.rating.delete({
        where: {
            id: candidat.id,
        },
        include: {
            users: {
                select: {
                    id: true,
                    fname: true,
                    lname: true,
                    photo: true,
                },
            },
        },
    })
}

export const updateGoodRating = async (userId, goodId, rating, text) => {
    const candidate = await prisma.rating.findFirst({
        where: {
            users_id: userId,
            goods_catalog_id: goodId,
        },
    })

    if (!candidate) throw 'GOOD_NOT_FOUND'

    const now = new Date()
    return await prisma.rating.update({
        where: {
            id: candidate.id,
        },
        data: {
            date: now,
            rating: rating,
            text: text,
        },
        include: {
            users: {
                select: {
                    id: true,
                    fname: true,
                    lname: true,
                    photo: true,
                },
            },
        },
    })
}

/* Получение разброса цены опр типа товароа */
export const getPriceRange = async (typeId) => {
    const data = await prisma.prices.aggregate({
        where: {
            goods_catalog_goods_catalog_price_idToprices: {
                sub_type_goods_id: typeId,
            },
        },
        _max: {
            price: true,
        },
        _min: {
            price: true,
            discount: true,
        },
    })

    const max = data._max.price
    const min = data._min.discount
        ? Math.min(data._min.discount, data._min.price)
        : data._min.price

    return { max, min }
}

/* Установка нового главного фото товара */
export const setMainGoodPhoto = async (goodId, fileName) => {
    // Находим товар
    const good = await prisma.goods_catalog.findUnique({
        where: {
            id: goodId,
        },
    })

    // Если товара нет то до свидания
    if (!good) throw 'GOOD_NOT_FOUND'

    // Проверяем наличие главного фото
    let haveMainPhoto = false
    if (good.main_photo_id) haveMainPhoto = true

    // Если оно есть то удаляем старое
    if (haveMainPhoto) {
        // TODO: При удалении фото первращать в null ссылку в таблице
        // Зануляем фото
        await prisma.goods_catalog.update({
            where: {
                id: goodId,
            },
            data: {
                main_photo_id: null,
            },
        })

        // Удаляем фото
        await prisma.goods_photo.delete({
            where: {
                id: good.main_photo_id,
            },
        })
    }

    // Создаём новое фото
    const newPhoto = await prisma.goods_photo.create({
        data: {
            photo: fileName,
            goods_catalog_id: goodId,
        },
    })

    // Задаём ссылку на новое главное фото
    return await prisma.goods_catalog.update({
        where: {
            id: goodId,
        },
        select: goodSelect,
        data: {
            main_photo_id: newPhoto.id,
        },
    })
}

/* Добавление нового фото товара */
export const addGoodPhoto = async (goodId, fileName) => {
    // Проверяем наличие товара
    const good = await prisma.goods_catalog.findUnique({
        where: {
            id: goodId,
        },
    })

    // Если такого товара нет то до свидания
    if (!good) throw 'GOOD_NOT_FOUND'

    // Создаём фото
    await prisma.goods_photo.create({
        data: {
            photo: fileName,
            goods_catalog_id: goodId,
        },
    })

    // Получаем и возвращаем обнавлённый товар
    return await prisma.goods_catalog.findUnique({
        where: {
            id: goodId,
        },
        select: goodSelect,
    })
}

/* Удалене фото товара */
export const removeGoodPhoto = async (photoId) => {
    // Находим кандидата на удаление
    const candidat = await prisma.goods_photo.findUnique({
        where: {
            id: photoId,
        },
    })

    // Если его нет то до свидания
    if (!candidat) throw 'GOOD_NOT_FOUND'

    // Убеждаемся что это фото не главное у товара
    let good = await prisma.goods_catalog.findFirst({
        where: {
            main_photo_id: candidat.id,
        },
    })

    // Если всё таки главное то убераем его из главного
    if (good) {
        good = await prisma.goods_catalog.update({
            where: {
                id: good.id,
            },
            data: {
                main_photo_id: null,
            },
        })
    }

    // Удаляем фото
    await prisma.goods_photo.delete({
        where: {
            id: photoId,
        },
    })

    return good
}

/* Получение товара по поиску */
export const getGoods = async (search = '', skip = 0, take = 10) => {
    const isSearchNum = !!search && isNumeric(search)
    const id = isSearchNum ? Number(search) : undefined
    const searchStr = search && search.length ? search : ''

    const goods = await prisma.goods_catalog.findMany({
        where: {
            OR: [
                { id: id },
                {
                    name: {
                        contains: searchStr,
                    },
                },
            ],
        },
        select: goodSelect,
        skip: skip,
        take: take,
    })

    const ans = await prisma.goods_catalog.aggregate({
        where: {
            OR: [
                { id: id },
                {
                    name: {
                        contains: searchStr,
                    },
                },
            ],
        },
        _count: true,
    })

    return { goods, count: ans._count }
}

/* Получение производителей по поиску */
export const getBrands = async (search = '', skip = 0, take = 10) => {
    const name = !!search.length ? search : undefined

    return prisma.brands.findMany({
        where: {
            name: {
                contains: name,
            },
        },
        select: {
            id: true,
            name: true,
        },
        skip,
        take,
    })
}

export const getGoodTypesBySearch = async (search) => {
    return await prisma.sub_type_goods.findMany({
        where: {
            name: {
                contains: search,
            },
        },
        take: 10,
        skip: 0,
    })
}

/* Обновление данных товара */
export const updateGoodData = async (
    goodId,
    name,
    subTypeId,
    brandId,
    description
) => {
    return await prisma.goods_catalog.update({
        where: {
            id: goodId,
        },
        data: {
            name: name === null ? undefined : name,
            sub_type_goods_id: subTypeId === null ? undefined : subTypeId,
            brand_id: brandId === null ? undefined : brandId,
            description: description === null ? undefined : description,
        },
        select: goodSelect,
    })
}

/* Обновление цены товара */
export const changeGoodPrice = async (goodId, price, discount) => {
    const date = new Date()

    return await prisma.prices.create({
        data: {
            date,
            price,
            discount,
            goods_catalog_id: goodId,
        },
        select: {
            id: true,
            date: true,
            price: true,
            discount: true,
        },
    })
}

export const createGood = async (subId, name) => {
    return await prisma.goods_catalog.create({
        data: {
            name,
            sub_type_goods_id: subId,
        },
        select: goodSelect,
    })
}

export const updateGlobalType = async (typeId, name) => {
    return await prisma.global_type_goods.update({
        where: {
            id: typeId,
        },
        data: {
            name,
        },
        include: {
            local_type_goods: {
                include: {
                    sub_type_goods: true,
                },
            },
        },
    })
}

export const updateLocalType = async (typeId, name) => {
    return await prisma.local_type_goods.update({
        where: {
            id: typeId,
        },
        data: {
            name,
        },
        include: {
            sub_type_goods: true,
        },
    })
}

export const updateSubType = async (typeId, name) => {
    return await prisma.sub_type_goods.update({
        where: {
            id: typeId,
        },
        data: {
            name,
        },
    })
}

export const updateSubTypePhoto = async (typeId, path) => {
    return await prisma.sub_type_goods.update({
        where: {
            id: typeId,
        },
        data: {
            photo: path,
        },
    })
}

export const addGlobalType = async (name) => {
    await prisma.global_type_goods.create({
        data: {
            name,
        },
    })
}

export const addLocalType = async (name, globalTypeId) => {
    await prisma.local_type_goods.create({
        data: {
            name,
            global_type_goods_id: globalTypeId,
        },
    })
}

export const addSubType = async (name, localTypeId) => {
    await prisma.sub_type_goods.create({
        data: {
            name,
            local_type_goods_id: localTypeId,
        },
    })
}

export const findGlobalTypes = async (search) => {
    return await prisma.global_type_goods.findMany({
        where: {
            name: {
                contains: search,
            },
        },
    })
}

export const findLocalTypes = async (search) => {
    return await prisma.local_type_goods.findMany({
        where: {
            name: {
                contains: search,
            },
        },
    })
}

export const deleteGlobalType = async (globalTypeId) =>
    await prisma.global_type_goods.delete({ where: { id: globalTypeId } })

export const deleteLocalType = async (localTypeId) =>
    await prisma.local_type_goods.delete({ where: { id: localTypeId } })

export const deleteSubType = async (subTypeId) =>
    await prisma.sub_type_goods.delete({ where: { id: subTypeId } })

// export const searchOrders = async (search) => {
//     return await prisma.orders.findUnique({
//         where: {
//             id: search,
//         },
//     })
// }
