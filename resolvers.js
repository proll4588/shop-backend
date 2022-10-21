import DB from './controllers/mysql.controller.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const goodSelect = {
    id: true,
    name: true,
    description: true,
    main_photo: true,
    brands: true,
    sub_type_goods: true,
    prices: {
        select: {
            price: true,
            discount: true,
        },
    },
}

const createFilterQ = (filters) => {
    const { brands, price, other } = filters

    const bq =
        brands && brands.length !== 0
            ? brands.map((el) => ({ brands: { name: el } }))
            : undefined

    // TODO: Если у товара есть скидка то при поиске она не учитывается
    const prices =
        price.min || price.max
            ? {
                  price: {
                      gte: filters.price.min ? filters.price.min : undefined,
                      lte: filters.price.max ? filters.price.max : undefined,
                  },
              }
            : undefined

    return {
        OR: bq,
        prices: prices,
    }
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

// TODO: Засунуть все параметры в filters
const qGoods = async (subId, search, filters) => {
    let searchString = search
    let where = {}

    if (!search) searchString = ''
    if (filters) where = createFilterQ(filters)

    if (subId) {
        return await prisma.goods_catalog.findMany({
            where: {
                sub_type_goods_id: subId,
                ...where,
            },
            select: goodSelect,
        })
    } else {
        return await prisma.goods_catalog.findMany({
            where: {
                OR: [
                    {
                        name: {
                            contains: searchString,
                        },
                    },
                    {
                        brands: {
                            name: {
                                contains: searchString,
                            },
                        },
                    },
                    {
                        sub_type_goods: {
                            name: {
                                contains: searchString,
                            },
                        },
                    },
                ],
                // TODO: Переопределение OR в объекте where
                ...where,
            },
            select: goodSelect,
        })
    }
}

const qBrands = async (subId) => {
    if (subId) {
        const ans = await prisma.goods_catalog.findMany({
            where: {
                sub_type_goods_id: subId,
            },
            select: {
                brands: true,
            },
        })
        return ans.map((el) => el.brands)
    }

    return await prisma.brands.findMany()
}

const qGood = async (id) => {
    return await prisma.goods_catalog.findUnique({
        where: {
            id: id,
        },
        select: goodSelect,
    })
}

// TODO: РЕализовать поиск минимальной и максимальной цены
const resolvers = {
    Query: {
        types: async () => await qTypes(),
        goods: async (_, { subId, search, filters }) =>
            await qGoods(subId, search, filters),
        brands: async (_, { subId }) => await qBrands(subId),
        good: async (_, { id }) => qGood(id),
    },
}

export default resolvers
