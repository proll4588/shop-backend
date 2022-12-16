import prisma from '../../controllers/prisma.controller.js'
import { getBrandsByTypeId } from '../Brand/brand.js'
import { getPriceRange } from '../Good/good.js'

/* Получение фильтров относящиеся к заданному типу товаров */
const getTypeFilters = async (typeId) => {
    return await prisma.characteristics_for_filters.findMany({
        where: {
            sub_type_goods_id: typeId,
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

/* Формирование всех (общих и не только) фильтров для опр. типа товара */
export const getAllGoodsFilters = async (typeId) => {
    /* Получаем бренды в сыром виде и формируем объект фильтра */
    let brands = await getBrandsByTypeId(typeId)
    const brand = {
        id: -1 * typeId,
        name: 'Производители',
        type: 'list',
        data: {
            values: brands.map((brand) => ({
                id: brand.id,
                value: brand.name,
            })),
        },
    }
    /*========================================================*/

    // TODO: Хард код!! Написать функцию которая бы находила max и min цену типа товаров
    /* Получаем min и max цену и формируем объект фильтра */
    const maxMin = await getPriceRange(typeId)
    const priceData = {
        min: maxMin.min | 0,
        max: maxMin.max | 0,
        id: -2 * typeId,
    }
    const price = {
        id: -2 * typeId,
        name: 'Цена',
        type: 'range',
        data: priceData,
    }
    /*========================================================*/

    /* Получаем фильтры типа и формируем массив объектов фильтров */
    const typeFiltersData = await getTypeFilters(typeId)
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
    /*========================================================*/

    return {
        generalFilters: {
            brand,
            price,
        },
        typeFilters,
    }
}
