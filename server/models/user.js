const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    // Compare raw password with hashed password
    async checkPassword(password) {
      // If the stored password looks like a bcrypt hash, verify using bcrypt.
      // Otherwise, compare plain text (useful for seed data created without hashing).
      if (this.password && this.password.startsWith('$2')) {
        return bcrypt.compare(password, this.password);
      }
      return password === this.password;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('patient', 'doctor', 'admin'),
        defaultValue: 'patient',
      },
      // Path or URL to the user's profile photo.  Stored in the database as a string.
      profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Password reset token for "forgot password" functionality.  When a user requests
      // a password reset, we generate a random token and set an expiration time.
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        // Hash password before creating
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        // Hash password before updating if changed
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};