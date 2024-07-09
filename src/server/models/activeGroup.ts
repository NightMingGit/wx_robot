import { DataTypes } from 'sequelize'
import sequelize from './sequelize'

const model = sequelize.define('active_group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  ids: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
})

export default model
