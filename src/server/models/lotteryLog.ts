import { DataTypes } from 'sequelize'
import sequelize from './sequelize'

const model = sequelize.define('lottery_log', {
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
    type: DataTypes.DATE,
    allowNull: false,
  },
  prizeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  getType: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: ['0', '1'],
    comment: '0打卡抽奖 1随机宝箱',
  },
}, {
  timestamps: false,
})

export default model
