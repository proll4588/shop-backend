import prisma from '../../controllers/prisma.controller.js'

const getMonday = (d) => {
    d = new Date(d)
    let day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1)
    return new Date(d.setDate(diff))
}

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

    // let start = new Date(mdata)
    // start.setDate(1)
    // let end = new Date()

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
                    lte: end,
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
                        lte: end,
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

export const getLocalTypeBuyDynamocByRange = async (
    globalTypeId,
    startDate,
    endDate
) => {
    let start = new Date(startDate)
    let end = new Date(endDate)
    let ans = []

    const localTypes = await prisma.local_type_goods.findMany({
        where: {
            global_type_goods_id:
                globalTypeId !== null ? globalTypeId : undefined,
        },
    })

    for (var i = 0; i < localTypes.length; i++) {
        const info = await prisma.delivery_info.aggregate({
            where: {
                orders: {
                    ...orderComplite,
                    date: {
                        gte: start,
                        lte: end,
                    },
                },
                goods_catalog: {
                    sub_type_goods: {
                        local_type_goods_id: localTypes[i].id,
                    },
                },
            },

            _sum: {
                price: true,
            },
        })

        ans.push({
            profit: info._sum.price,
            localType: localTypes[i],
        })
    }

    return {
        startDate: start,
        endDate: end,
        data: ans,
    }
}

export const getSubTypeBuyDynamocByRange = async (
    localTypeId,
    startDate,
    endDate
) => {
    let start = new Date(startDate)
    let end = new Date(endDate)
    let ans = []

    const subTypes = await prisma.sub_type_goods.findMany({
        where: {
            local_type_goods_id: localTypeId !== null ? localTypeId : undefined,
        },
    })

    for (var i = 0; i < subTypes.length; i++) {
        const info = await prisma.delivery_info.aggregate({
            where: {
                orders: {
                    ...orderComplite,
                    date: {
                        gte: start,
                        lte: end,
                    },
                },
                goods_catalog: {
                    sub_type_goods_id: subTypes[i].id,
                },
            },

            _sum: {
                price: true,
            },
        })

        ans.push({
            profit: info._sum.price,
            subType: subTypes[i],
        })
    }

    return {
        startDate: start,
        endDate: end,
        data: ans,
    }
}

export const getProfitByMonth = async (date) => {
    const curDate = date ? new Date(date) : new Date()
    // console.log(curDate)

    let start = new Date(curDate)
    start.setDate(1)
    let end = new Date(curDate)

    const startInfo = await prisma.delivery_info.aggregate({
        where: {
            orders: {
                ...orderComplite,
                date: {
                    gte: start,
                    lte: end,
                },
            },
        },

        _sum: {
            price: true,
        },
    })

    end.setDate(0)
    start = new Date(end)
    start.setDate(1)

    const lastInfo = await prisma.delivery_info.aggregate({
        where: {
            orders: {
                ...orderComplite,
                date: {
                    gte: start,
                    lte: end,
                },
            },
        },

        _sum: {
            price: true,
        },
    })

    return {
        currentMonth: {
            profit: startInfo._sum.price,
        },
        lastMonth: {
            profit: lastInfo._sum.price,
        },
    }
}

export const addVisit = async () => {
    const curDate = new Date(new Date().toISOString().slice(0, 10))
    let condidate = await prisma.visits.findFirst({
        where: {
            date: curDate,
        },
    })

    if (!condidate) {
        condidate = await prisma.visits.create({
            data: {
                date: curDate,
                visits: 1,
            },
        })
    } else {
        condidate = await prisma.visits.update({
            where: {
                id: condidate.id,
            },
            data: {
                visits: {
                    increment: 1,
                },
            },
        })
    }
}

export const getVisitByDate = async (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const info = await prisma.visits.aggregate({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
        _sum: {
            visits: true,
        },
    })

    return info._sum.visits
}

export const getVisitMonth = async () => {
    const curDate = new Date()

    // TODO: Сделать функцию которая выдаст все нужыне даты
    let start = new Date()
    start.setDate(1)
    let end = new Date(curDate)

    const curInfo = await getVisitByDate(start, end)

    end.setDate(0)
    start = new Date(end)
    start.setDate(1)

    const lastInfo = await getVisitByDate(start, end)

    return {
        curVisits: curInfo || 0,
        lastVisits: lastInfo || 0,
    }
}

export const getOrderCountByDate = async (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const info = await prisma.orders.count({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
    })

    return info
}

export const getOrderCountMonth = async () => {
    const curDate = new Date()

    let start = new Date()
    start.setDate(1)
    let end = new Date(curDate)

    const curInfo = await getOrderCountByDate(start, end)

    end.setDate(0)
    start = new Date(end)
    start.setDate(1)

    const lastInfo = await getOrderCountByDate(start, end)

    return {
        curOrderCount: curInfo,
        lastOrderCount: lastInfo,
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
