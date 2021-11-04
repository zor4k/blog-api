import { create } from "domain";
import Pool from "mysql/lib/Pool";
import { createPool } from "mysql2/promise";
import { PoolConnection } from "mysql2/typings/mysql";


const HOST = process.env.SQL_HOST;
const PASSWORD = process.env.SQL_PASSWORD;
const DB = process.env.SQL_DB;
const USER = process.env.SQL_USER;

const config={
	host: HOST,
	user: USER ,
	database: DB,
	password: PASSWORD,
}

const pool= require('mysql2/promise').createPool(config);

export default pool;