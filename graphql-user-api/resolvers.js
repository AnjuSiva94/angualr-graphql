const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: true }
];

const resolvers = {
  Query: {
    users: () => users,
    user: (_, { id }) => users.find(user => user.id === id),
    searchUser: (_, { name }) => users.find(user => user.name === name),
    searchUsersByDomain: (_, { domain }) => users.filter(user => user.email.includes(domain)),
    userCount: () => users.length
  },
  Mutation: {
    createUser: (_, { name, email }) => {
      const newUser = { id: (users.length + 1).toString(), name, email, active: true };
      users.push(newUser);
      return newUser;
    },
    updateUser: (_, { id, name, email }) => {
      const user = users.find(user => user.id === id)
      if (!user) return null

      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      return user;
    },
    deleteUser: (_, { id }) => {
      const index = users.findIndex(user => user.id === id);
      if (index === -1) return false;

      users.splice(index, 1);
      return true;
    },
    toggleUserStatus: (_, { id }) => {
      const user = users.find(user => user.id === id)
      if (!user) return null;

      user.active = !user.active;
      return user;
    },

    deactivateAllUsers: () => {
      users.forEach(user => user.active = false);
      return true;
    }

  }
};

module.exports = resolvers;
