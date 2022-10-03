import DB from "./controllers/mysql.controller.js"

const qTypes = async () => {
  const globalTypes = await DB.query("SELECT * FROM global_type_goods")
  const localTypes = await DB.query("SELECT * FROM local_type_goods")
  const subTypes = await DB.query("SELECT * FROM sub_type_goods")

  const localTypes_subTypes = localTypes.map(localtype => {
    const ans = {
      id: localtype.id,
      name: localtype.name,
      photo: localtype.photo,
      global_type_goods_id: localtype.global_type_goods_id,
      subGoodsTypes: []
    }

    subTypes.forEach(subtype => {
        if (subtype.local_type_goods_id === localtype.id) ans.subGoodsTypes.push({
          id: subtype.id,
          name: subtype.name,
          photo: subtype.photo,
        })
    })

    return ans
  })

  const globalTypes_localTypes_subTypes = globalTypes.map(globaltype => {
    const ans = {
      id: globaltype.id,
      name: globaltype.name,
      photo: globaltype.photo,
      localGoodsTypes: []
    }

    localTypes_subTypes.forEach(localtype => {
      if (localtype.global_type_goods_id === globaltype.id) ans.localGoodsTypes.push({
        id: localtype.id,
        name: localtype.name,
        photo: localtype.photo,
        subGoodsTypes: localtype.subGoodsTypes
      })
    })

    return ans
  })


  return globalTypes_localTypes_subTypes
}

const qGoods = async (subId) => {
  let goods = await DB.query(`select * from goods_catalog where sub_type_goods_id like ${subId}`)
  
  const brandIds = goods.map(good => good.brand_id)
  let brandsInfo = brandIds.map(async id => await DB.query(`select * from brands where id like ${id}`))
  brandsInfo = await Promise.all(brandsInfo)

  goods = goods.map(good => {
    const brand = brandsInfo.find(el => {
      console.log(el[0].id, good.brand_id);
      return el[0].id === good.brand_id
    })
    return {
      id: good.id,
      name: good.name,
      description: good.description,
      main_photo: good.main_photo,
      brand: brand[0]
    }
  })

  return goods
}

const resolvers = {
    Query: {
      types: async() => await qTypes(),
      goods: async(_, {subId}) => await qGoods(subId)
    },
};

export default resolvers