import { createConnection } from "typeorm";
import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import config from './config';

import Task from './models/Task';
import SystemConfig from './models/SystemConfig';
import UserCache from './models/UserCache';

let entitiesList = [Task, SystemConfig, UserCache];

let dbConnConfig: MysqlConnectionOptions | SqliteConnectionOptions;

if (config.dbType == "sqlite") {
    dbConnConfig = {
        type: "sqlite",
        database: config.sqlite.database,
        entities: entitiesList,
        synchronize: true,
        logging: false
    };
} else if (config.dbType == "mysql") {
    dbConnConfig = {
        type: "mysql",
        database: config.mysql.database,
        host: config.mysql.host,
        port: config.mysql.port,
        username: config.mysql.username,
        password: config.mysql.password,
        charset: config.mysql.charset,
        entities: entitiesList,
        synchronize: true,
        logging: false
    }
}

const conn = createConnection(dbConnConfig);
export default conn;