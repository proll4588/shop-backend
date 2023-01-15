import prisma from '../../controllers/prisma.controller.js'

const orderComplite = {
    OR: [
        {
            operations_status_id: 2,
        },
        {
            operations_status_id: 3,
        },
    ],
}

export const getStatisticByMonth = async (date) => {
    const mdate = new Date(date)

    const year = mdate.getFullYear()
    const month = mdate.getMonth()

    let start = new Date(year, month, 2)
    let end
    if (month === 12) end = new Date(year + 1, 0, 2)
    else end = new Date(year, month + 1, 2)

    const info = await prisma.delivery_info.aggregate({
        where: {
            orders: {
                ...orderComplite,
                date: {
                    gte: start,
                    lt: end,
                },
            },
        },

        _sum: {
            price: true,
        },
    })

    return { date: start, profit: info._sum.price }
}

export const getBuyDynamicByYear = async (yaer) => {
    let info = []
    for (var i = 0; i < 12; i++) {
        let start = new Date(yaer, i, 2)

        const data = await getStatisticByMonth(start)
        info.push(data)
    }

    return info
}

export const getGlobalTypeBuyDynamicByRange = async (startDate, endDate) => {
    let start = new Date(startDate)
    let end = new Date(endDate)
    let ans = []

    const globalTypes = await prisma.global_type_goods.findMany()

    for (var i = 0; i < globalTypes.length; i++) {
        const info = await prisma.delivery_info.aggregate({
            where: {
                orders: {
                    ...orderComplite,
                    date: {
                        gte: start,
                        lt: end,
                    },
                },
                goods_catalog: {
                    sub_type_goods: {
                        local_type_goods: {
                            global_type_goods_id: globalTypes[i].id,
                        },
                    },
                },
            },

            _sum: {
                price: true,
            },
        })

        ans.push({
            profit: info._sum.price,
            globalType: globalTypes[i],
        })
    }

    return {
        startDate: start,
        endDate: end,
        data: ans,
    }
}

// ?
export const getStatisticByGoods = async (dateStart, dateEnd) => {
    const start = new Date(dateStart)
    const end = new Date(dateEnd)

    const goodsInfo = await prisma.delivery_info.groupBy({
        by: ['goods_catalog_id'],
        where: {
            orders: {
                ...orderComplite,
                date: {
                    gte: start,
                    lt: end,
                },
            },
        },

        _sum: {
            count: true,
            price: true,
        },
    })

    const ans = goodsInfo.map((good) => ({
        goods_catalog_id: good.goods_catalog_id,
        count_buy: good._sum.count,
        profit: good._sum.price,
    }))

    return ans
}
