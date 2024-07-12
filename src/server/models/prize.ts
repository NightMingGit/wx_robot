import { DataTypes } from 'sequelize'
import sequelize from './sequelize'

const model = sequelize.define('prize', {
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
  type: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: ['0', '1', '2', '3', '4'],
    comment: '0:空，1:固定金币，2:金币翻倍，3:卡，4:扣除金币',
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '如果是金币翻倍，则表示翻倍倍数，如果是固定金币，则表示固定金币数量',
  },
  // 概率
  probability: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 获得的类型 0打卡抽奖 1随机宝箱
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
