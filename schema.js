import { gql } from 'apollo-server'

const typeDefs = gql`
    scalar Timestamp

    type GlobalGoodsType {
        id: Int
        name: String
        photo: String
        local_type_goods: [LocalGoodsType]
    }

    type LocalGoodsType {
        id: Int
        name: String
        photo: String
        sub_type_goods: [SubGoodsType]
    }

    type SubGoodsType {
        id: Int
        name: String
        photo: String
    }

    type Brand {
        id: Int
        name: String
        logo: String
    }

    type Price {
        price: Float
        discount: Float
    }

    type FullPrice {
        id: Int
        goods_catalog_id: Int
        price: Float
        date: Timestamp
        discount: Float
    }

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
    }

    type Photo {
        id: Int!
        goods_catalog_id: Int
        photo: String!
    }

    type Query {
        types: [GlobalGoodsType]
        #goods(subId: Int, search: String, filters: Filters): [Good]
        brands(subId: Int): [Brand]
        good(id: Int!): Good
        filters(subId: Int!): AllFilters
        goodCharacteristics(goodId: Int!): [CharacteristicGroup]
        filteredGoods(subId: Int!, filters: AllFilterState): [Good]
    }

    ##########* Filters *###########

    type AllFilters {
        generalFilters: GeneralFilters!
        typeFilters: [Filter]!
    }

    type GeneralFilters {
        #shop
        #rating
        #discount
        price: Filter!
        brand: Filter!
    }

    enum FilterTypes {
        list
        range
    }

    type FilterListData {
        values: [FiltersListDataElement]
    }

    type FiltersListDataElement {
        id: Int!
        value: String!
    }

    type FilterRangeData {
        id: Int!

        max: Float!
        min: Float!
    }

    union FilterData = FilterListData | FilterRangeData

    type Filter {
        id: Int
        name: String!
        type: FilterTypes!
        data: FilterData!
    }

    ##inputs

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

    type CharacteristicGroup {
        id: Int!
        name: String!
        items: [CharacteristicItem]!
    }

    type CharacteristicItem {
        id: Int!
        name: String!
        value: String!
        description: String
    }

    ########################
`

export default typeDefs
