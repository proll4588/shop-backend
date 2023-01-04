import * as dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { throwNewGQLError } from './GraphQLError.js'
import { createUser, getUserByEmail } from './models/User/user.js'

const secret = process.env.SECRET

// TODO: В отдельный файл
export const signJWT = (id) => {
    const isAdmin = id === 11
    return jwt.sign({ id, isAdmin }, secret, { expiresIn: '24h' })
}

/*
 * Проверка валидности токена (проверка авторизации) при
 * вызове любого запроса
 */
export const context = ({ req, res }) => {
    const token = req.headers.authorization || ''
    if (!token) return { verified: false }

    try {
        const info = jwt.verify(token, secret)
        return { verified: true, userId: info.id, isAdmin: info.isAdmin }
    } catch (e) {
        return { verified: false, isAdmin: false }
    }
}

/* Проверка авторрзованности пользователя */
export const checkUserAuth = (context) => {
    const { verified } = context
    if (!verified) throwNewGQLError('USER_IS_NOT_AUTHENTICATED')

    return true
}

/* Логин пользователя по почте и паролю */
export const login = async (email, password) => {
    /* Проверка наличия пользователя */
    const user = await getUserByEmail(email)
    if (!user) throwNewGQLError('USER_NOT_FOUND')

    /* Проверка валидности пароля */
    const validPass = bcrypt.compareSync(password, user.password)
    if (!validPass) throwNewGQLError('PASSWORD_IS_NOT_CORRECT')

    /* Если всё ок, то подписываем токен и отправляем клиенту */
    const token = signJWT(user.id)
    return { token, isAdmin: user.id === 11 }
}

/* Регистрация пользователя */
export const registrate = async (email, password) => {
    /* Проверка наличия пользователя */
    const user = await getUserByEmail(email)
    if (user) throwNewGQLError('USER_IS_ALREADY_EXIST')

    /* Хэшируем пароль */
    const hashPass = bcrypt.hashSync(password, 7)

    /* Создаём нового пользователя */
    const newUser = await createUser(email, hashPass)

    /* Подписываем токен и отправляем клиенту */
    const token = signJWT(newUser.id)
    return { token }
}

/* Проверка валидности токена */
export const VerifyToken = (context) => ({
    verify: context.verified,
    isAdmin: context.isAdmin,
})
