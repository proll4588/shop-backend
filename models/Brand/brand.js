import prisma from '../../controllers/prisma.controller.js'

/* Получение производителей заданного типа товаров */
export const getBrandsByTypeId = async (typeId) => {
    return await prisma.brands.findMany({
        where: {
            goods_catalog: {
                some: {
                    sub_type_goods_id: typeId,
                },
            },
        },
    })
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
