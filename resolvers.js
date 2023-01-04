import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import { checkUserAuth, login, registrate, VerifyToken } from './auth.js'
import {
    addGoodPhoto,
    addGoodToCart,
    addGoodToFavorite,
    changeGoodCountInCart,
    changeGoodPrice,
    createGood,
    createGoodRating,
    deleteGoodRating,
    getBrands,
    getCartCount,
    getFavoriteCount,
    getFavoriteGoods,
    getGoodById,
    getGoodRating,
    getGoodTypesBySearch,
    getGoods,
    getGoodsByFlters,
    getGoodsInCart,
    getTypes,
    removeGoodFromCart,
    removeGoodFromFavorite,
    removeGoodPhoto,
    setMainGoodPhoto,
    updateGoodData,
    updateGoodRating,
} from './models/Good/good.js'
import { getAllGoodsFilters } from './models/Filters/filters.js'
import {
    getUserById,
    getUserData,
    setUserPhoto,
    updateUserData,
} from './models/User/user.js'
import {
    addCharacteristicGroup,
    addCharacteristicList,
    addCharacteristicToGood,
    addCharacteristicValue,
    deleteGoodCharacteristic,
    getCharacteristicGroupsByGoodId,
    getCharacteristicList,
    getCharacteristicValues,
    getGoodCharacteristics,
} from './models/Characteristics/characteristics.js'
import { throwNewGQLError } from './GraphQLError.js'
import { savePhoto } from './photo.js'
import { createOrder, getOrders } from './models/Order/order.js'
import { createBrand } from './models/Brand/brand.js'

/*========================/ Controles /=============================*/

/* Good */

// --Без авторизации
const qTypes = async () => await getTypes()
const qGood = async (goodId) => await getGoodById(goodId)
const qGetGoods = async (search, skip, take) =>
    await getGoods(search, skip, take)
const qFilteredGoods = async (filters, subId) =>
    await getGoodsByFlters(filters, subId)
const qGetBrands = async (search, skip, take) =>
    await getBrands(search, skip, take)
const qcreateBrand = async (name, logo) => await createBrand(name, logo)
const qGetGoodTypesBySearch = async (search) =>
    await getGoodTypesBySearch(search)
const qUpdateGoodData = async (
    goodId,
    name,
    subTypeId,
    brandId,
    description
) => {
    return await updateGoodData(goodId, name, subTypeId, brandId, description)
}
const qUpdateGoodPrice = async (goodId, price, discount) =>
    await changeGoodPrice(goodId, price, discount)
const qGetCharacteristicGroupsByGoodId = async (goodId, search) =>
    await getCharacteristicGroupsByGoodId(goodId, search)
const qGetCharacteristicList = async (groupId, search) =>
    await getCharacteristicList(groupId, search)
const qGetCharacteristicValues = async (listId, search) =>
    await getCharacteristicValues(listId, search)
const qAddCharacteristicToGood = async (goodId, listId, valueId) =>
    await addCharacteristicToGood(goodId, listId, valueId)

const qAddCharacteristicGroup = async (subId, name) =>
    await addCharacteristicGroup(subId, name)
const qAddCharacteristicList = async (groupId, name) =>
    await addCharacteristicList(groupId, name)
const qAddCharacteristicValue = async (listId, value) =>
    await addCharacteristicValue(listId, value)
const qDeleteGoodCharacteristic = async (goodId, itemId) =>
    await deleteGoodCharacteristic(goodId, itemId)
const qCreateGood = async (subId, name) => await createGood(subId, name)

const qRating = async (goodId) => await getGoodRating(goodId)

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
const qCreateRating = async (context, goodId, rating, text) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await createGoodRating(userId, goodId, rating, text)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qDeleteRating = async (context, goodId) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await deleteGoodRating(userId, goodId)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qUpdateRating = async (context, goodId, rating, text) => {
    checkUserAuth(context)
    const { userId } = context
    try {
        return await updateGoodRating(userId, goodId, rating, text)
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

/* Uploads */
const qUploadUserPhoto = async (file, context) => {
    checkUserAuth(context)
    const { userId } = context
    const photoPath = await savePhoto(file, 'usersPhoto')
    return await setUserPhoto(userId, photoPath)
}

const qUploadMainGoodPhoto = async (file, goodId) => {
    const photoPath = await savePhoto(file, 'goodsPhoto')
    try {
        return await setMainGoodPhoto(goodId, photoPath)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qUploadGoodPhoto = async (file, goodId) => {
    const photoPath = await savePhoto(file, 'goodsPhoto')
    try {
        return await addGoodPhoto(goodId, photoPath)
    } catch (e) {
        throwNewGQLError(e)
    }
}
const qRemoveGoodPhoto = async (photoId) => {
    try {
        return await removeGoodPhoto(photoId)
    } catch (e) {
        throwNewGQLError(e)
    }
}

const qUploadLogoForNewBrand = async (file) => {
    return await savePhoto(file, 'brandsLogo')
}

// const qUploadTypePhoto = async (file, context) => {
//     // checkUserAuth(context)
//     // const { userId } = context
//     const photoPath = await savePhoto(file, 'usersPhoto', userId)
//     return await setUserPhoto(userId, photoPath)
// }
/* ======= */

/* Order */
const qCreateOrder = async (context, payStatus, orderType) => {
    checkUserAuth(context)
    const { userId } = context

    try {
        return await createOrder(userId, payStatus, orderType)
    } catch (e) {
        throwNewGQLError(e)
    }
}

const qGetOrders = async (context, skip, take, operStatus, search) => {
    checkUserAuth(context)
    const { userId } = context

    return await getOrders(userId, skip, take, operStatus, search)
}
/* ======= */

/*==================================================================*/

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
        getGoods: async (_, { search, skip, take }) =>
            await qGetGoods(search, skip, take),
        filteredGoods: async (_, { filters, subId }) =>
            qFilteredGoods(filters, subId),
        getBrands: async (_, { search, skip, take }) =>
            await qGetBrands(search, skip, take),
        getGoodTypesBySearch: async (_, { search }) =>
            qGetGoodTypesBySearch(search),
        getCharacteristicGroupsByGoodId: async (_, { goodId, search }) =>
            await qGetCharacteristicGroupsByGoodId(goodId, search),
        getCharacteristicList: async (_, { groupId, search }) =>
            await qGetCharacteristicList(groupId, search),
        getCharacteristicValues: async (_, { listId, search }) =>
            await qGetCharacteristicValues(listId, search),

        getFavorite: async (_, __, context) => await qGetFavorite(context),
        getCart: async (_, __, context) => await qGetGoodsInCart(context),

        getFavoriteCount: async (_, __, context) =>
            await qGetFavoriteCount(context),
        getCartCount: async (_, __, context) => await qGetCartCount(context),

        getRating: async (_, { goodId }) => await qRating(goodId),
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

        /* Orders */
        getOrders: async (_, { skip, take, operStatus, search }, context) =>
            await qGetOrders(context, skip, take, operStatus, search),
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

        addCharacteristicGroup: async (_, { subId, name }) =>
            await qAddCharacteristicGroup(subId, name),
        addCharacteristicList: async (_, { groupId, name }) =>
            await qAddCharacteristicList(groupId, name),
        addCharacteristicValue: async (_, { listId, value }) =>
            await qAddCharacteristicValue(listId, value),
        deleteGoodCharacteristic: async (_, { goodId, itemId }) =>
            await qDeleteGoodCharacteristic(goodId, itemId),

        createRating: async (_, { goodId, rating, text }, context) =>
            await qCreateRating(context, goodId, rating, text),
        deleteGoodRating: async (_, { goodId }, context) =>
            await qDeleteRating(context, goodId),
        updateRating: async (_, { goodId, rating, text }, context) =>
            await qUpdateRating(context, goodId, rating, text),
        createBrand: async (_, { name, logo }) =>
            await qcreateBrand(name, logo),
        updateGoodData: async (
            _,
            { goodId, name, subTypeId, brandId, description }
        ) =>
            await qUpdateGoodData(
                goodId,
                name,
                subTypeId,
                brandId,
                description
            ),
        updateGoodPrice: async (_, { goodId, price, discount }) =>
            await qUpdateGoodPrice(goodId, price, discount),
        addCharacteristicToGood: async (_, { goodId, listId, valueId }) =>
            await qAddCharacteristicToGood(goodId, listId, valueId),

        createGood: async (_, { subId, name }) =>
            await qCreateGood(subId, name),
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
        uploadMainGoodPhoto: async (_, { file, goodId }) =>
            await qUploadMainGoodPhoto(file, goodId),
        uploadGoodPhoto: async (_, { file, goodId }) =>
            await qUploadGoodPhoto(file, goodId),
        deleteGoodPhoto: async (_, { photoId }) =>
            await qRemoveGoodPhoto(photoId),
        uploadLogoForNewBrand: async (_, { file }) =>
            qUploadLogoForNewBrand(file),
        /* ======= */

        /* Order */
        createOrder: async (_, { payStatus, orderType }, context) =>
            await qCreateOrder(context, payStatus, orderType),
        /* ======= */
    },
}

export default resolvers
