import { DataTypes } from 'sequelize'
import sequelize from './sequelize'

const model = sequelize.define('user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
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
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  card: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: false,
})

export default model
