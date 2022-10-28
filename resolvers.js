import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const goodSelect = {
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

const createFilterQ = (filters) => {
    const { brands, price, other } = filters

    const bq =
        brands && brands.length !== 0
            ? brands.map((el) => ({ brands: { name: el } }))
            : undefined

    // TODO: Если у товара есть скидка то при поиске она не учитывается(
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
        current_price: prices,
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

// Так получаем все типы, даже те которые не используются
const qFilters = async (subId) => {
    const ans = await prisma.characteristics_for_filters.findMany({
        where: {
            sub_type_goods_id: subId,
        },
        select: {
            characteristics_list: {
                include: {
                    characteristics_params: true,
                },
            },
        },
    })

    return ans
}

/*
query Types($subId: Int!) {
  filters(subId: $subId) {
    characteristics_list {
      id
      name
      is_custom_value
      characteristics_params {
        id
        value
      }
    }
  }
}
*/

// Получаем даже те характеристики которые не прописаны, но в теории должны быть
const qCharacteristics = async (goodId) => {
    const ans = await prisma.characteristics_groups.findMany({
        where: {
            characteristics_list: {
                some: {
                    goods_characteristics: {
                        some: {
                            goods_catalog_id: goodId,
                        },
                    },
                },
            },
        },
        include: {
            characteristics_list: {
                include: {
                    goods_characteristics: {
                        include: {
                            characteristics_params: true,
                        },
                    },
                },
            },
        },
    })

    return ans
}
/*
query Characteristics($goodId: Int!) {
  characteristics(goodId: $goodId) {
    id
    name
    characteristics_list {
      id
      name
      description
      is_custom_value
      goods_characteristics {
        id
        value
        characteristics_params {
          value
          id
        }
      }
    }
  }
}
*/

// TODO: РЕализовать поиск минимальной и максимальной цены
const resolvers = {
    Query: {
        types: async () => await qTypes(),
        goods: async (_, { subId, search, filters }) =>
            await qGoods(subId, search, filters),
        brands: async (_, { subId }) => await qBrands(subId),
        good: async (_, { id }) => qGood(id),
        filters: async (_, { subId }) => qFilters(subId),
        characteristics: async (_, { goodId }) => qCharacteristics(goodId),
    },
}

export default resolvers
