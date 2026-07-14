import { DataSource } from "typeorm"
import 'dotenv/config';
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3307"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: ["src/models/entity/*.ts"],
    timezone: '+07:00',
    subscribers: [],
    migrations: [],
    namingStrategy: new SnakeNamingStrategy(),
})