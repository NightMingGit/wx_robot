import './user'
import './sign'
import './message'
import './activeGroup'
import sequelize from './sequelize'

sequelize.sync({ alter: true })
