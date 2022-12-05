module.exports = (sequelize, DataTypes) => {
  const Chatting = sequelize.define(
    "chatting",
    {
      chat: {
        type: DataTypes.STRING(120),
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return Chatting;
};
