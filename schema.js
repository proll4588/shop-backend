import { gql } from 'apollo-server'

const typeDefs = gql`
  type GlobalGoodsType {
    id: Int
    name: String
    photo: String
    localGoodsTypes: [LocalGoodsType]
  }

  type LocalGoodsType {
    id: Int
    name: String
    photo: String
    subGoodsTypes: [SubGoodsType]
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

  type Good {
    id: Int
    name: String
    description: String
    main_photo: String
    brand: Brand
  }


  type Query {
    types: [GlobalGoodsType]
    goods(subId: Int): [Good]
  }
`;

export default typeDefs