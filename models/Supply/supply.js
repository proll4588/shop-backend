import prisma from '../../controllers/prisma.controller.js'

export const createSuppliers = async (name, addres, phone, email) => {
    return await prisma.suppliers.create({
        data: {
            name,
            addres,
            phone,
            email,
        },
    })
}

export const getSuppliers = async (skip = 0, take = 10, search = '') => {
    const searchStr = search.length ? search : undefined
    return await prisma.suppliers.findMany({
        where: {
            name: {
                contains: searchStr,
            },
        },
        skip,
        take,
    })
}

// data = {goodId, count}
export const createSupplies = async (data, supId) => {
    const date = new Date()
    const supply = await prisma.supplies.create({
        data: {
            date: date,
            suppliers_id: supId,
        },
    })

    for (var i = 0; i < data.length; i++) {
        await prisma.supplies_info.create({
            data: {
                count: data[i].count,
                goods_catalog_id: data[i].goodId,
                supplies_id: supply.id,
            },
        })
        // await addGoodToStorage(data[i].goodId, data[i].count)
    }

    return supply
}

export const getSupplies = async (skip = 0, take = 10, search = '') => {
    const isSearchNum = !!search && isNumeric(search)
    const id = isSearchNum ? Number(search) : undefined
    const searchStr = search && search.length ? search : undefined

    return await prisma.supplies.findMany({
        where: {
            supplies_info: {
                some: {
                    goods_catalog: {
                        name: {
                            contains: searchStr,
                        },
                    },
                },
            },
            id: id,
        },
        select: {
            id: true,
            count: true,
            supplies_info: {
                select: {
                    id: true,
                    goods_catalog: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    count: true,
                },
            },
        },
        skip,
        take,
    })
}

export const addGoodCountToStorage = async (goodId, count) => {
    await prisma.storage.update({
        where: {
            goods_catalog_id: goodId,
        },
        data: {
            count: {
                increment: count,
            },
        },
    })
}
