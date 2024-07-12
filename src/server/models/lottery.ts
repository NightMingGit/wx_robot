import { DataTypes } from 'sequelize'
import sequelize from './sequelize'
// 这个是群里发起抽奖
const model = sequelize.define('lottery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '发起人',
  },
  // 中奖人
  winner: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '抽奖名称',
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '抽奖人数',
  },
  list: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '抽奖名单',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM,
    values: ['0', '1'],
    comment: '0 未开奖 1 已开奖',
  },
}, {
  timestamps: false,
})

export default model
