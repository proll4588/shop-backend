import prisma from '../../controllers/prisma.controller.js'

/* Получение производителей заданного типа товаров */
export const getBrandsByTypeId = async (typeId) => {
    const ans = await prisma.goods_catalog.findMany({
        where: {
            sub_type_goods_id: typeId,
        },
        select: {
            brands: true,
        },
    })
    return ans.map((el) => el.brands)
}

/* Создание новго производителя */
export const createBrand = async (name, photo = null) => {
    return prisma.brands.create({
        data: {
            name: name,
            logo: photo,
        },
    })
}
