import prisma from '../controllers/prisma.controller.js'

const getBrands = async (subId) => {
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

const getTypeFilters = async (subId) => {
    return await prisma.characteristics_for_filters.findMany({
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
}

/* Формирование всех (общих и не только) фильтров для опр типа товара  */
export const qAllFilters = async (subId) => {
    // Получаем бренды в сыром виде и формируем объект фильтра
    let brands = await getBrands(subId)
    const brand = {
        id: -1,
        name: 'Производители',
        type: 'list',
        data: {
            values: brands.map((brand) => ({
                id: brand.id,
                value: brand.name,
            })),
        },
    }
    ////////////////////

    // TODO: Хард код!! Написать функцию которая бы находила max и min цену типа товаров
    // Получаем min и max цену и формируем объект фильтра
    const priceData = { min: 0, max: 10000, id: -2 }
    const price = {
        id: -2,
        name: 'Цена',
        type: 'range',
        data: priceData,
    }
    ////////////////////

    // Получаем фильтры типа и формируем массив объектов фильтров
    const typeFiltersData = await getTypeFilters(subId)
    let typeFilters = typeFiltersData.map(({ characteristics_list }) => {
        return {
            id: characteristics_list.id,
            name: characteristics_list.name,
            type: 'list',
            data: {
                values: characteristics_list.characteristics_params.map(
                    (param) => ({
                        id: param.id,
                        value: param.value,
                    })
                ),
            },
        }
    })

    return {
        generalFilters: {
            brand,
            price,
        },
        typeFilters,
    }
}
