import { create } from "domain";
import { createPool } from "mysql2/promise";
import { PoolConnection } from "mysql2/typings/mysql";

const mysql = require('mysql2/promise');

const HOST = process.env.SQL_HOST;
const PASSWORD = process.env.SQL_PASSWORD;
const DB = process.env.SQL_DB;
const USER = process.env.USER;


interface IPool{
	pool : any
	createPool(): Promise<PoolConnection>,
	getPool(): Promise<PoolConnection>
}

const Pool: IPool = {
	pool: null, 

	createPool : async function(){
		const pool = await mysql.createPool({
			host: HOST,
			password: PASSWORD,
			database: DB,
			user: USER ,

		});
		return pool;
	},

	getPool : async function(){
		if(!this.pool){
			this.pool = await this.createPool();
		}

		return this.pool;
	}
}


export default Pool;
export { IPool };