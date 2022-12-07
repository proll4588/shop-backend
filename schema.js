import { gql } from 'apollo-server'

const typeDefs = gql`
    scalar Timestamp
    scalar date
    scalar Upload

    ##########* Types *###########

    # Глобальные типы товаров
    type GlobalGoodsType {
        id: Int
        name: String
        photo: String
        local_type_goods: [LocalGoodsType]
    }

    # Локальные типы товаров
    type LocalGoodsType {
        id: Int
        name: String
        photo: String
        sub_type_goods: [SubGoodsType]
    }

    # Подтипы(типы) Товароы
    type SubGoodsType {
        id: Int
        name: String
        photo: String
    }

    ########################

    ##########* Good *###########

    # Произодитель
    type Brand {
        id: Int
        name: String
        logo: String
    }

    # Основные данные цены
    type Price {
        price: Float
        discount: Float
    }

    # Все данные о цене
    type FullPrice {
        id: Int
        goods_catalog_id: Int
        price: Float
        date: Timestamp
        discount: Float
    }

    # Товар
    type Good {
        id: Int!
        name: String!
        description: String

        main_photo: Photo
        all_photos: [Photo]

        current_price: Price
        all_prices: [Price]

        brands: Brand
        sub_type_goods: SubGoodsType

        avg_rating: AvgRating
        storage: Storage
    }

    type Storage {
        count: Int!
    }

    type AvgRating {
        count: Int!
        avg: Float!
    }

    # Фото товара
    type Photo {
        id: Int!
        goods_catalog_id: Int
        photo: String!
    }

    ########################

    ##########* Filters *###########

    # Полный список всех фильтров товаров типа
    type AllFilters {
        generalFilters: GeneralFilters!
        typeFilters: [Filter]!
    }

    # Фильтры, которые не зависят от типа товаров
    type GeneralFilters {
        #shop
        #rating
        #discount
        price: Filter!
        brand: Filter!
    }

    # Типы фильтов
    enum FilterTypes {
        # Список
        list

        # В виде диапазона
        range
    }

    # Данные для списка фильтра
    type FilterListData {
        values: [FiltersListDataElement]
    }

    # Данные одного элемента списка фильтров
    type FiltersListDataElement {
        id: Int!
        value: String!
    }

    # Данные для фильтра диапазона
    type FilterRangeData {
        id: Int!

        max: Float!
        min: Float!
    }

    # Объединение данных фильтров в виде списка и в виде диапазона
    union FilterData = FilterListData | FilterRangeData

    # Данные о фильтре
    type Filter {
        id: Int
        name: String!
        type: FilterTypes!
        data: FilterData!
    }

    ###* inputs * ###

    input AllFilterState {
        generalFilters: GeneralFilterState
        typeFilters: [TypeFilterState]
    }

    input GeneralFilterState {
        brand: [Int]
        price: RangeFilterState
    }

    input RangeFilterState {
        max: Float
        min: Float
    }

    input ListFilterState {
        values: [Int]
    }

    input TypeFilterState {
        id: Int
        state: [Int]
    }

    ########################

    ##########* Characteristic *###########

    # Группа характеристик
    type CharacteristicGroup {
        id: Int!
        name: String!
        items: [CharacteristicItem]!
    }

    # элемент группы характеристики
    type CharacteristicItem {
        id: Int!
        name: String!
        value: String!
        description: String
    }

    ########################

    ##########* Запросы *###########

    type Query {
        types: [GlobalGoodsType]
        good(id: Int!): Good
        filters(subId: Int!): AllFilters
        goodCharacteristics(goodId: Int!): [CharacteristicGroup]
        filteredGoods(subId: Int!, filters: AllFilterState): [Good]

        login(email: String!, password: String!): Token
        verifyToken: Verify
        user: User
        userData: User

        getFavorite: [Good]
        getCart: [Cart]

        getFavoriteCount: Int
        getCartCount: Int

        getRating(goodId: Int!): [Rating]

        getOrders(
            skip: Int
            take: Int
            operStatus: String
            search: String
        ): GetOrders
    }

    type Mutation {
        registration(email: String!, password: String!): Token

        addToFavorite(goodId: Int!): [Favorite]
        removeFavorite(goodId: Int!): [Favorite]

        addToCart(goodId: Int!, count: Int!): [Cart]
        removeFromCart(goodId: Int!): [Cart]
        changeGoodInCart(goodId: Int!, count: Int!): [Cart]

        updateUserData(data: UserData): User

        #uploadFile(file: Upload!): File!
        uploadUserPhoto(file: Upload!): User

        createRating(goodId: Int!, rating: Int!, text: String): Rating
        deleteGoodRating(goodId: Int!): Rating
        updateRating(goodId: Int!, rating: Int, text: String): Rating

        createOrder(payStatus: PayStatus!, orderType: OrderTypes!): Order
    }

    type File {
        url: String!
    }

    type Token {
        token: String!
    }

    type Verify {
        verify: Boolean
    }

    type Favorite {
        id: Int!
        goods_catalog_id: Int!
        users_id: Int!
    }

    type Rating {
        id: Int!
        goods_catalog_id: Int
        users_id: Int
        users: UserRating!
        rating: Int!
        text: String
        date: date
    }

    type UserRating {
        id: Int!
        fname: String
        lname: String
        photo: String
    }

    ##########* Пользователь *###########

    type User {
        id: Int!

        fname: String
        lname: String

        email: String!
        phone_number: String
        date_of_birthday: date
        gender: Int
        address: Address
        photo: String
    }

    type Address {
        id: Int!
        city: String
        street: String
        ZIP: Int
        country: String
    }

    input UserData {
        user: UserInfo
        address: AddresInfo
    }

    input UserInfo {
        fname: String
        lname: String
        email: String
        phone_number: String
        date_of_birthday: date
        gender: Boolean
        photo: String
    }

    input AddresInfo {
        country: String
        city: String
        street: String
        ZIP: Int
    }

    ##########* Карзина *###########

    type Cart {
        id: Int!
        count: Int!
        goods_catalog: Good
    }

    ##########* Заказ *###########

    type GetOrders {
        count: Int!
        data: [Order]
    }

    type Order {
        id: Int!
        date: date!
        operations_status_id: Int!
        payment_status_id: Int!
        order_types_id: Int!
        delivery_info: [DeliveryInfo]
    }

    type DeliveryInfo {
        id: Int!
        goods_catalog: Good!
        count: Int!
        prices: Price
    }

    enum PayStatus {
        notPay
        pay
    }

    enum OrderTypes {
        deliver
        fromShop
    }
`

export default typeDefs
