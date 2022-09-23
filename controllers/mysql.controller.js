import * as dotenv from 'dotenv'
dotenv.config()

import mysql from "mysql"
import util from "util"

class DBController {
    constructor({user, password, host, database}) {
        this.connection = mysql.createConnection({
            host,
            user,
            password,
            database
        });

        this.connection.connect();

        this.query = util.promisify(this.connection.query).bind(this.connection)
    }
}

const DB = new DBController({user: process.env.USER, password: process.env.PASSWORD, host: process.env.HOST, database: "goodsmanager"})

export default DB