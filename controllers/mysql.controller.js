import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql";
import util from "util";

class DBController {
    constructor({ user, password, host, database }) {
        this.connection = mysql.createConnection({
            host,
            user,
            password,
            database,
        });

        this.connection.connect();

        this.query = util
            .promisify(this.connection.query)
            .bind(this.connection);
    }
}

const DB = new DBController({
    user: "root",
    password: "k05012sk",
    host: "127.0.0.1",
    database: "shop",
});

export default DB;
