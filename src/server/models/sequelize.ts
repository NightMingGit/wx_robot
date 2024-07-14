import { Sequelize } from 'sequelize'

// 配置数据库连接
const sequelize = new Sequelize('robot_data', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false,
  define: {
    freezeTableName: true,
  },
  dialectOptions: {
    timezone: 'local',
    dateStrings: true,
    typeCast: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

export default sequelize
