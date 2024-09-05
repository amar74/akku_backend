const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const createSuperUser = async () => {
  await prisma.masterUser.create({
    data: {
      email: 'admin@akkukachasma.com',
      password: bcrypt.hashSync('Admin@123', 10),
      name: 'Admin',
    },
  });
};

const main = async () => {
  await createSuperUser();
  process.exit(0);
};

try {
  // main();
  // createSuperUser();
  // createPayrollCalendarTypes();
} catch (error) {
  // eslint-disable-next-line
  console.log(error);
  process.exit(1);
} finally {
  prisma.$disconnect();
}
