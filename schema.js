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

    input PriceFilter {
        min: Float
        max: Float
    }

    input OtherFilter {
        name: String
        params: [String]
    }

    input Filters {
        brands: [String]
        price: PriceFilter
        other: [OtherFilter]
    }

    #type Filter {
    #    characteristics_list: Characteristic_list_el
    #}

    type Good_characteristic {
        id: Int
        goods_catalog_id: Int
        characteristics_list_id: Int
        characteristics_params_id: Int
        value: String
        characteristics_params: Characteristics_param
    }

    type Characteristics_param {
        id: Int
        characteristics_list_id: Int
        value: String
    }

    type Characteristic_list_el {
        id: Int
        characteristics_groups_id: Int
        name: String
        description: String
        is_custom_value: Boolean
        characteristics_params: [Characteristics_param]
        goods_characteristics: [Good_characteristic]
    }

    type Characteristics_group {
        id: Int
        name: String
        characteristics_list: [Characteristic_list_el]
    }

    type Query {
        types: [GlobalGoodsType]
        goods(subId: Int, search: String, filters: Filters): [Good]
        brands(subId: Int): [Brand]
        good(id: Int!): Good
        filters(subId: Int!): AllFilters
        characteristics(goodId: Int!): [Characteristics_group]
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

    ########################

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
`

export default typeDefs
