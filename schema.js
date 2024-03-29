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
        id: Int
        date: date
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
        show: Boolean!

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
        items: [CharacteristicItem]
    }

    # элемент группы характеристики
    type CharacteristicItem {
        id: Int!
        name: String!
        value: String!
        description: String
    }

    type CharacteristicList {
        id: Int!
        name: String!
    }

    type CharacteristicValue {
        id: Int!
        value: String!
    }

    type GoodCharacteristic {
        id: Int!
        goods_catalog_id: Int!
        characteristics_list_id: Int!
        characteristics_params_id: Int!
    }

    ########################

    type FilteredGoodsFetch {
        totalCount: Int!
        goods: [Good]
    }

    ##########* Запросы *###########

    type Query {
        types: [GlobalGoodsType]
        good(id: Int!): Good
        getGoods(search: String, skip: Int, take: Int): GetGoods
        filters(subId: Int!): AllFilters
        goodCharacteristics(goodId: Int!): [CharacteristicGroup]
        filteredGoods(
            subId: Int!
            filters: AllFilterState
            skip: Int
            take: Int
            sort: Int
        ): FilteredGoodsFetch
        getBrands(search: String, skip: Int, take: Int): [Brand]
        getGoodTypesBySearch(search: String!): [SubGoodsType]
        getCharacteristicGroupsByGoodId(
            goodId: Int!
            search: String
        ): [CharacteristicGroup]
        getCharacteristicList(
            groupId: Int!
            search: String
        ): [CharacteristicList]
        getCharacteristicValues(
            listId: Int!
            search: String
        ): [CharacteristicValue]

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

        #searchOrders(search: Int!): Order

        getAdminOrders(
            skip: Int
            take: Int
            operStatus: String
            search: String
        ): GetOrders
        #findOrderById(id: Int!): Order

        findGlobalType(search: String!): [GlobalGoodsType]
        findLocalType(search: String!): [LocalGoodsType]

        getBuyDynamicByYear(year: Int!): [MonthStat]
        getGlobalTypeBuyDynamicByRange(
            startDate: date!
            endDate: date!
        ): GlobalTypeStats
        getLocalTypeBuyDynamicByRange(
            globalTypeId: Int
            startDate: date!
            endDate: date!
        ): LocalTypeStats
        getSubTypeBuyDynamicByRange(
            localTypeId: Int
            startDate: date!
            endDate: date!
        ): SubTypeStats

        getProfitByMonth(date: date): MonthStats
        getVisitMonth: MonthVisit
        getOrderCountMonth: MonthOrderCount

        getSuppliers(take: Int, skip: Int, search: String): [Supplier]
    }

    type Mutation {
        registration(email: String!, password: String!): Token

        addToFavorite(goodId: Int!): [Favorite]
        removeFavorite(goodId: Int!): [Favorite]

        addToCart(goodId: Int!, count: Int!): [Cart]
        removeFromCart(goodId: Int!): [Cart]
        changeGoodInCart(goodId: Int!, count: Int!): [Cart]

        updateUserData(data: UserData): User
        createBrand(name: String!, logo: String): Brand

        createGood(subId: Int!, name: String!): Good

        updateGoodData(
            goodId: Int!
            name: String
            subTypeId: Int
            brandId: Int
            description: String
        ): Good
        updateGoodPrice(goodId: Int!, price: Float!, discount: Float): Price
        addCharacteristicToGood(
            goodId: Int!
            listId: Int!
            valueId: Int!
        ): GoodCharacteristic

        addCharacteristicGroup(subId: Int!, name: String!): CharacteristicGroup
        addCharacteristicList(groupId: Int!, name: String!): CharacteristicList
        addCharacteristicValue(
            listId: Int!
            value: String!
        ): CharacteristicValue
        deleteGoodCharacteristic(goodId: Int!, itemId: Int!): Int

        ####################
        uploadUserPhoto(file: Upload!): User

        uploadMainGoodPhoto(file: Upload!, goodId: Int!): Good
        uploadGoodPhoto(file: Upload!, goodId: Int!): Good
        deleteGoodPhoto(photoId: Int!): Good
        uploadLogoForNewBrand(file: Upload!): String

        #uploadTypePhoto(file: Upload!): User
        ####################

        createRating(goodId: Int!, rating: Int!, text: String): Rating
        deleteGoodRating(goodId: Int!): Rating
        updateRating(goodId: Int!, rating: Int, text: String): Rating

        createOrder(payStatus: PayStatus!, orderType: OrderTypes!): Order

        updateGlobalType(globalTypeId: Int!, name: String!): GlobalGoodsType
        updateLocalType(localTypeId: Int!, name: String!): LocalGoodsType
        updateSubType(subTypeId: Int!, name: String!): SubGoodsType
        uploadSubPhoto(subTypeId: Int!, file: Upload!): SubGoodsType

        addGlobalType(name: String!): GlobalGoodsType
        addLocalType(name: String!, globalTypeId: Int!): LocalGoodsType
        addSubType(name: String!, localTypeId: Int!): SubGoodsType

        deleteGlobalType(globalTypeId: Int!): GlobalGoodsType
        deleteLocalType(localTypeId: Int!): LocalGoodsType
        deleteSubType(subTypeId: Int!): SubGoodsType

        updateOrderStatus(orderId: Int!, status: String!): Order

        changeGoodStatus(goodId: Int!, status: Boolean!): Good
        addVisit: Boolean
        createSuppliers(
            name: String!
            addres: String!
            phone: String!
            email: String!
        ): Supplier
        createSupplies(supData: [SupplieData]!, supId: Int!): Supplie
    }

    type GetGoods {
        count: Int!
        goods: [Good]
    }

    type File {
        url: String!
    }

    type Token {
        token: String!
        isAdmin: Boolean
    }

    type Verify {
        verify: Boolean
        isAdmin: Boolean
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

    type OrderUser {
        id: Int!
        email: String
        photo: String
        phone_number: String
    }

    type Order {
        id: Int!
        date: date!
        operations_status_id: Int!
        payment_status_id: Int!
        order_types_id: Int!
        delivery_info: [DeliveryInfo]
        users: OrderUser
    }

    type DeliveryInfo {
        id: Int!
        goods_catalog: Good!
        count: Int!
        price: Float!
    }

    enum PayStatus {
        notPay
        pay
    }

    enum OrderTypes {
        deliver
        fromShop
    }

    type MonthStat {
        date: date!
        profit: Float
    }

    type GlobalTypeStats {
        startDate: date!
        endDate: date!
        data: [GlobalTypeStat]
    }

    type GlobalTypeStat {
        profit: Float
        globalType: GlobalGoodsType!
    }

    type LocalTypeStats {
        startDate: date!
        endDate: date!
        data: [LocalTypeStat]
    }

    type LocalTypeStat {
        profit: Float
        localType: LocalGoodsType!
    }

    type SubTypeStats {
        startDate: date!
        endDate: date!
        data: [SubTypeStat]
    }

    type SubTypeStat {
        profit: Float
        subType: SubGoodsType!
    }

    type MonthStats {
        currentMonth: MonthStat
        lastMonth: MonthStat
    }

    type MonthStat {
        profit: Float
    }

    type MonthVisit {
        curVisits: Int!
        lastVisits: Int!
    }

    type MonthOrderCount {
        curOrderCount: Int!
        lastOrderCount: Int!
    }

    type Supplier {
        id: Int!
        name: String!
        addres: String!
        phone: String!
        email: String
    }

    input SupplieData {
        goodId: Int!
        count: Int!
    }

    type Supplie {
        id: Int!
        date: date!
        suppliers_id: Int!
    }
`

export default typeDefs
