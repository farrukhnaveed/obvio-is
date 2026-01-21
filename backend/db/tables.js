const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Document = sequelize.define('Document', {
  name: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  content: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  totalWordCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'pending'
  }
});

const Term = sequelize.define('Term', {
  word: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  docCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 // This represents df(t)
  }
});

const TermFrequency = sequelize.define('TermFrequency', {
  word: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  frequency: { 
    type: DataTypes.INTEGER, 
    allowNull: false // This represents TF(t,d)
  }
});

Document.hasMany(TermFrequency, { onDelete: 'CASCADE' });
TermFrequency.belongsTo(Document);

const initDb = async () => {
  await sequelize.sync(); // Creates tables if they don't exist
};

module.exports = {
  Document,
  Term,
  TermFrequency,
  initDb
};
