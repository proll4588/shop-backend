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
