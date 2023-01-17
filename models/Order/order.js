import prisma from '../../controllers/prisma.controller.js'
import { goodSelect } from '../Good/good.js'

function randomInteger(min, max) {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1)
    return Math.round(rand)
}

// В инструменты
const isNumeric = (n) => !isNaN(n)

const payStatuses = {
    notPay: 2,
    pay: 1,
}

const orderTypes = {
    deliver: 1,
    fromShop: 2,
}

const operStatuses = {
    inProc: 1,
    deliv: 2,
    denied: 4,
    getted: 3,
    ready: 5,
}

const orderSelect = {
    id: true,
    date: true,
    operations_status_id: true,
    payment_status_id: true,
    order_types_id: true,
    delivery_info: {
        select: {
            id: true,
            goods_catalog: {
                select: goodSelect,
            },
            count: true,
            price: true,
        },
    },
    users: {
        select: {
            id: true,
            email: true,
            phone_number: true,
            photo: true,
        },
    },
}

/* Оформление заказа */
export const createOrder = async (userId, payStatus, orderType) => {
    // Получаем товары из карзины пользователя
    const cartGoods = await prisma.cart.findMany({
        where: {
            users_id: userId,
        },
        include: {
            goods_catalog: {
                include: {
                    current_price: true,
                },
            },
        },
    })

    // Проверяем наличие товаров в корзине
    if (!cartGoods.length) throw 'GOOD_NOT_FOUND'

    // Создаём объект заказа
    // const dateNow = new Date(2022, randomInteger(0, 11), 10)
    const dateNow = new Date()
    const order = await prisma.orders.create({
        data: {
            date: dateNow,
            users_id: userId,
            operations_status_id: operStatuses.inProc,
            payment_status_id: payStatuses[payStatus],
            order_types_id: orderTypes[orderType],
        },
    })

    // Заполняем содержимое заказа
    await prisma.delivery_info.createMany({
        data: cartGoods.map((good) => ({
            orders_id: order.id,
            goods_catalog_id: good.goods_catalog.id,
            count: good.count,
            price:
                (good.goods_catalog.current_price.discount ||
                    good.goods_catalog.current_price.price) * good.count,
        })),
    })

    // TODO: Это должно леч на плечи бд
    // Очистка корзины пользователя
    await prisma.cart.deleteMany({
        where: {
            users_id: userId,
        },
    })

    return await prisma.orders.findUnique({
        where: { id: order.id },
        select: orderSelect,
    })
}

/* Получение всего списка заказов */
export const getOrders = async (
    userId,
    skip = 0,
    take = 200,
    operStatus = undefined,
    search = ''
) => {
    const statusId = operStatus ? operStatuses[operStatus] : undefined

    const isSearchNum = !!search && isNumeric(search)
    const id = isSearchNum ? Number(search) : undefined
    const searchStr = search && search.length ? search : undefined

    const data = await prisma.orders.findMany({
        where: {
            users_id: userId,
            operations_status_id: statusId,
            OR: [
                { id: id },
                {
                    delivery_info: {
                        every: {
                            goods_catalog: { name: { contains: searchStr } },
                        },
                    },
                },
            ],
        },
        select: orderSelect,
        take,
        skip,
    })

    const count = await prisma.orders.count({
        where: {
            users_id: userId,
            operations_status_id: statusId,
            OR: [
                { id: id },
                {
                    delivery_info: {
                        every: {
                            goods_catalog: { name: { contains: searchStr } },
                        },
                    },
                },
            ],
        },
    })

    return { data, count }
}

export const getAdminOrders = async (
    skip = 0,
    take = 200,
    operStatus = undefined,
    search = ''
) => {
    const statusId = operStatus ? operStatuses[operStatus] : undefined

    const isSearchNum = !!search && isNumeric(search)
    const id = isSearchNum ? Number(search) : undefined
    const searchStr = search && search.length ? search : undefined

    const data = await prisma.orders.findMany({
        where: {
            operations_status_id: statusId,
            OR: [
                { id: id },
                {
                    delivery_info: {
                        every: {
                            goods_catalog: { name: { contains: searchStr } },
                        },
                    },
                },
            ],
        },
        select: {
            ...orderSelect,
        },
        take,
        skip,
    })

    const count = await prisma.orders.count({
        where: {
            operations_status_id: statusId,
            OR: [
                { id: id },
                {
                    delivery_info: {
                        every: {
                            goods_catalog: { name: { contains: searchStr } },
                        },
                    },
                },
            ],
        },
    })

    return { data, count }
}

export const updateOrderStatus = async (id, status) => {
    return await prisma.orders.update({
        where: {
            id,
        },
        data: {
            operations_status_id: operStatuses[status],
        },
    })
}
