import './user'
import './sign'
import sequelize from './sequelize'

sequelize.sync({ alter: true })
