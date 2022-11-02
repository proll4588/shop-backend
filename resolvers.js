import prisma from './controllers/prisma.controller.js'
import { qLogin, qReg, qUser, qVerifyToken } from './resolvers/auth.js'
import { qAllFilters, qFilteredGoods } from './resolvers/filters.js'

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
}

const qTypes = async () =>
    await prisma.global_type_goods.findMany({
        include: {
            local_type_goods: {
                include: {
                    sub_type_goods: true,
                },
            },
        },
    })

const qGood = async (id) => {
    return await prisma.goods_catalog.findUnique({
        where: {
            id: id,
        },
        select: goodSelect,
    })
}

const qGoodCharacteristics = async (goodId) => {
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
            // Оставляем только те группы у еоторых есть заданные параметры
            .filter((group) => group.items.length !== 0)
    )
}

// TODO: Реализовать поиск минимальной и максимальной цены
const resolvers = {
    // Проверка типа
    FilterData: {
        __resolveType: (obj) => {
            return 'values' in obj ? 'FilterListData' : 'FilterRangeData'
        },
    },
    Query: {
        types: async () => await qTypes(),
        filteredGoods: async (_, { filters, subId }) =>
            qFilteredGoods(filters, subId),
        good: async (_, { id }) => qGood(id),
        filters: async (_, { subId }) => qAllFilters(subId),
        goodCharacteristics: async (_, { goodId }) =>
            qGoodCharacteristics(goodId),
        login: async (_, { email, password }) => await qLogin(email, password),
        verifyToken: (_, __, context) => qVerifyToken(context),
        user: async (_, __, context) => await qUser(context),
    },
    Mutation: {
        registration: async (_, { email, password }) =>
            await qReg(email, password),
    },
}

export default resolvers
