import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import { checkUserAuth, login, registrate, VerifyToken } from './auth.js'
import {
    addGoodToCart,
    addGoodToFavorite,
    changeGoodCountInCart,
    getCartCount,
    getFavoriteCount,
    getFavoriteGoods,
    getGoodById,
    getGoodsByFlters,
    getGoodsInCart,
    getTypes,
    removeGoodFromCart,
    removeGoodFromFavorite,
} from './models/Good/good.js'
import { getAllGoodsFilters } from './models/Filters/filters.js'
import {
    getUserById,
    getUserData,
    setUserPhoto,
    updateUserData,
} from './models/User/user.js'
import { getGoodCharacteristics } from './models/Characteristics/characteristics.js'
import { throwNewGQLError } from './GraphQLError.js'
import { savePhoto } from './photo.js'

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
const qGetGoodsInCart = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getGoodsInCart(userId)
}
const qAddGoodToCart = async (context, goodId, count) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await addGoodToCart(userId, goodId, count)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qRemoveGoodFromCart = async (context, goodId) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await removeGoodFromCart(userId, goodId)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qChangeGoodCountInCart = async (context, goodId, count) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await changeGoodCountInCart(userId, goodId, count)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qGetFavoriteCount = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getFavoriteCount(userId)
}
const qGetCartCount = async (context) => {
    checkUserAuth(context)
    const { userId } = context
    return await getCartCount(userId)
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

/* Uploads */
const qUploadUserPhoto = async (file, context) => {
    checkUserAuth(context)
    const { userId } = context
    const photoPath = await savePhoto(file, 'usersPhoto')
    return await setUserPhoto(userId, photoPath)
}
/* ======= */

/*==================================================================*/

// const qUploadFile = async (file) => {
//     const { createReadStream, filename, mimetype, encoding } = await file

//     const stream = createReadStream()
//     const pathname = path.join(__dirname, `/public/images/${filename}`)

//     const out = fs.createWriteStream(pathname)
//     stream.pipe(out)
//     await finished(out)

//     return { url: `http://localhost:4000/images/${filename}` }
// }

// TODO: Реализовать поиск минимальной и максимальной цены
const resolvers = {
    Upload: GraphQLUpload,
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
        getCart: async (_, __, context) => await qGetGoodsInCart(context),

        getFavoriteCount: async (_, __, context) =>
            await qGetFavoriteCount(context),
        getCartCount: async (_, __, context) => await qGetCartCount(context),
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

        addToCart: async (_, { goodId, count }, context) =>
            await qAddGoodToCart(context, goodId, count),
        removeFromCart: async (_, { goodId }, context) =>
            await qRemoveGoodFromCart(context, goodId),
        changeGoodInCart: async (_, { goodId, count }, context) =>
            await qChangeGoodCountInCart(context, goodId, count),
        /* ======= */

        /* Auth */
        registration: async (_, { email, password }) =>
            await qRegistrate(email, password),
        /* ======= */

        /* User */
        updateUserData: async (_, { data }, context) =>
            await qUserUpdate(context, data),
        /* ======= */

        /* Uploads */
        uploadUserPhoto: async (_, { file }, context) =>
            await qUploadUserPhoto(file, context),
        /* ======= */

        // uploadFile: async (_, { file }) => await qUploadFile(file),

        // updateUserData: async (_, { userData }, context) =>
        //     checkUserAuth(context) && qUpdateUserData(context, userData),
    },
}

export default resolvers
