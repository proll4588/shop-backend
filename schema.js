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

    type Query {
        types: [GlobalGoodsType]
        goods(subId: Int, search: String, filters: Filters): [Good]
        brands(subId: Int): [Brand]
        good(id: Int!): Good
        photos(id: Int!): [String]
    }
`

export default typeDefs
