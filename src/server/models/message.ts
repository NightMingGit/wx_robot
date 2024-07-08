import { DataTypes } from 'sequelize'
import sequelize from './sequelize'

const model = sequelize.define('message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: false,
})

export default model
