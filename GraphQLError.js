import { GraphQLError } from 'graphql'

export const throwNewGQLError = (code) => {
    switch (code) {
        case 'GOOD_ALREADY_EXIST':
            throw new GraphQLError('Good is already exist', {
                extensions: {
                    code: 'GOOD_ALREADY_EXIST',
                    http: { status: 400 },
                },
            })

        case 'GOOD_NOT_FOUND':
            throw new GraphQLError('Good is not found', {
                extensions: {
                    code: 'GOOD_NOT_FOUND',
                    http: { status: 400 },
                },
            })

        case 'USER_IS_NOT_AUTHENTICATED':
            throw new GraphQLError('User is not authenticated', {
                extensions: {
                    code: 'USER_IS_NOT_AUTHENTICATED',
                    http: { status: 401 },
                },
            })

        case 'USER_NOT_FOUND':
            throw new GraphQLError('User is not found', {
                extensions: {
                    code: 'USER_NOT_FOUND',
                    http: { status: 404 },
                },
            })

        case 'PASSWORD_IS_NOT_CORRECT':
            throw new GraphQLError('Password is not correct', {
                extensions: {
                    code: 'PASSWORD_IS_NOT_CORRECT',
                    http: { status: 400 },
                },
            })

        case 'USER_IS_ALREADY_EXIST':
            throw new GraphQLError('User is already exist', {
                extensions: {
                    code: 'USER_IS_ALREADY_EXIST',
                    http: { status: 400 },
                },
            })

        default:
            throw new GraphQLError('UnKnow error', {
                extensions: {
                    code,
                    http: { status: 400 },
                },
            })
    }
}
