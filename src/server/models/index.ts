import './user'
import './sign'
import './message'
import sequelize from './sequelize'

sequelize.sync({ alter: true })
