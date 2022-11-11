import { checkUserAuth, login, registrate, VerifyToken } from './auth.js'
import {
    addGoodToFavorite,
    getFavoriteGoods,
    getGoodById,
    getGoodsByFlters,
    getTypes,
    removeGoodFromFavorite,
} from './models/Good/good.js'
import { getAllGoodsFilters } from './models/Filters/filters.js'
import { getUserById, getUserData, updateUserData } from './models/User/user.js'
import { getGoodCharacteristics } from './models/Characteristics/characteristics.js'
import { throwNewGQLError } from './GraphQLError.js'

/*========================/ Controles /=============================*/

/* Good */

// --Без авторизации
const qTypes = async () => await getTypes()
const qGood = async (goodId) => await getGoodById(goodId)
const qFilteredGoods = async (filters, subId) =>
    await getGoodsByFlters(filters, subId)

// --С авторизацией
const qGetFavorite = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getFavoriteGoods(userId)
}
const qAddToFavorite = async (context, goodId) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await addGoodToFavorite(userId, goodId)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qRemoveFromFavorite = async (context, goodId) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await removeGoodFromFavorite(userId, goodId)
    } catch (e) {
        throwNewGQLError(e)
    }
}
/* ================================================= */

/* Filters */
const qAllFilters = async (typeId) => await getAllGoodsFilters(typeId)
/* ================================================= */

/* Auth */
const qLogin = async (email, password) => await login(email, password)
const qRegistrate = async (email, password) => await registrate(email, password)
const qVerifyToken = (context) => VerifyToken(context)
/* ================================================= */

/* User */
// С авторизацией
const qUser = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getUserById(userId)
}
const qUserUpdate = async (context, data) => {
    checkUserAuth(context)
    const { userId } = context
    return await updateUserData(userId, data)
}
const qUserData = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getUserData(userId)
}
/* ======= */

/* Characteristics */
const qGoodCharacteristics = async (goodId) =>
    await getGoodCharacteristics(goodId)
/* ======= */

/*==================================================================*/

// TODO: Реализовать поиск минимальной и максимальной цены
const resolvers = {
    // Проверка типа
    FilterData: {
        __resolveType: (obj) => {
            return 'values' in obj ? 'FilterListData' : 'FilterRangeData'
        },
    },
    Query: {
        /* Good */
        types: async () => await qTypes(),
        good: async (_, { id }) => await qGood(id),
        filteredGoods: async (_, { filters, subId }) =>
            qFilteredGoods(filters, subId),

        getFavorite: async (_, __, context) => await qGetFavorite(context),
        /* ======= */

        /* Filters */
        filters: async (_, { subId }) => await qAllFilters(subId),
        /* ======= */

        /* Auth */
        login: async (_, { email, password }) => await qLogin(email, password),
        verifyToken: (_, __, context) => qVerifyToken(context),
        /* ======= */

        /* User */
        user: async (_, __, context) => await qUser(context),
        userData: async (_, __, context) => await qUserData(context),
        /* ======= */

        /* Characteristics */
        goodCharacteristics: async (_, { goodId }) =>
            qGoodCharacteristics(goodId),
        /* ======= */
    },
    Mutation: {
        /* Good */
        addToFavorite: async (_, { goodId }, context) =>
            qAddToFavorite(context, goodId),
        removeFavorite: async (_, { goodId }, context) =>
            qRemoveFromFavorite(context, goodId),
        /* ======= */

        /* Auth */
        registration: async (_, { email, password }) =>
            await qRegistrate(email, password),
        /* ======= */

        /* User */
        updateUserData: async (_, { data }, context) =>
            await qUserUpdate(context, data),
        /* ======= */

        // updateUserData: async (_, { userData }, context) =>
        //     checkUserAuth(context) && qUpdateUserData(context, userData),
    },
}

export default resolvers
