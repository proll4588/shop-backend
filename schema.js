import { gql } from 'apollo-server'

const typeDefs = gql`
    # Всевозможные типы товаров
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

    # Брэнд (производитель)
    type Brand {
        id: Int
        name: String
        logo: String
    }

    # Цена
    type Prices {
        price: Float
        discount: Float
    }

    # Товар
    type Good {
        id: Int
        name: String
        description: String
        main_photo: String
        brands: Brand
        sub_type_goods: SubGoodsType
        prices: Prices
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
    }
`

export default typeDefs
