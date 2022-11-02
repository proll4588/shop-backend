import prisma from '../controllers/prisma.controller.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { GraphQLError } from 'graphql'

const secret = process.env.SECRET

export const signJWT = (id) => {
    return jwt.sign({ id }, secret, { expiresIn: '24h' })
}

export const qLogin = async (email, password) => {
    const user = await prisma.users.findFirst({
        where: {
            email: email,
        },
        select: {
            id: true,
            password: true,
        },
    })

    if (!user)
        throw new GraphQLError('User is not found', {
            extensions: {
                code: 'NOTFOUND',
                http: { status: 404 },
            },
        })

    const validPass = bcrypt.compareSync(password, user.password)
    if (!validPass)
        throw new GraphQLError('Password is not correct', {
            extensions: {
                code: 'PASSWORDISNOTCORRECT',
                http: { status: 400 },
            },
        })

    const token = signJWT(user.id)
    return { token }
}

export const qReg = async (email, password) => {
    const user = await prisma.users.findFirst({
        where: {
            email: email,
        },
    })

    if (user)
        throw new GraphQLError('User is already exist', {
            extensions: {
                code: 'EXIST',
                http: { status: 400 },
            },
        })

    const hashPass = bcrypt.hashSync(password, 7)
    const data = {
        email,
        password: hashPass,
    }
    const newUser = await prisma.users.create({
        data,
    })

    const token = signJWT(newUser.id)
    return { token }
}

export const qVerifyToken = (context) => ({ verify: context.verified })

export const qUser = async (context) => {
    const { userId } = context
    if (!userId)
        throw new GraphQLError('User is not authenticated', {
            extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 },
            },
        })

    return await prisma.users.findUnique({
        where: {
            id: userId,
        },
    })
}
