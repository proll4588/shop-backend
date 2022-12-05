import prisma from '../../controllers/prisma.controller.js'
import { goodSelect } from '../Good/good.js'

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
    })

    // Проверяем наличие товаров в корзине
    if (!cartGoods.length) throw 'GOOD_NOT_FOUND'

    // Создаём объект заказа
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
            goods_catalog_id: good.goods_catalog_id,
            count: good.count,
        })),
    })

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
export const getOrders = async (userId) => {
    return await prisma.orders.findMany({
        where: { users_id: userId },
        select: orderSelect,
    })
}
