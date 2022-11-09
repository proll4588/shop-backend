import prisma from '../../controllers/prisma.controller.js'

/* Получение пользователя по его id */
export const getUserById = async (userId) => {
    return await prisma.users.findUnique({
        where: {
            id: userId,
        },
    })
}

/* Получение пользователя по его почте */
export const getUserByEmail = async (email) => {
    return await prisma.users.findFirst({
        where: {
            email,
        },
    })
}

/* Создание нового пользователя */
export const createUser = async (email, password) => {
    return await prisma.users.create({
        data: {
            email,
            password,
        },
    })
}

/* Получение информации о пользователе */
export const getUserData = async (userId) => {
    return await prisma.users.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            phone_number: true,
            date_of_birthday: true,
            gender: true,
            photo: true,

            address: true,
        },
    })
}

/* Обновление пользовательских данных */
export const updateUserData = async (userId, data) => {
    let addres
    // Смотрим наличие адреса у пользователя
    if (data.address) {
        addres = await prisma.address.findFirst({
            where: {
                users: {
                    some: {
                        id: userId,
                    },
                },
            },
        })

        if (addres) {
            // Если адресс есть то обновляем данные
            await prisma.address.update({
                where: {
                    id: addres.id,
                },
                data: data.address,
            })
        } else {
            // Если нет то создаём
            addres = await prisma.address.create({
                data: data.address,
            })
        }
    }

    // Обновляем данные пользователя
    return await prisma.users.update({
        where: {
            id: userId,
        },
        data: {
            ...data.user,
            date_of_birthday: data.user.date_of_birthday
                ? new Date(data.user.date_of_birthday)
                : undefined,
            address_id: addres ? addres.id : undefined,
        },
    })
}
