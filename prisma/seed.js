const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use a singleton pattern for PrismaClient
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  // Create dummy users for each role
  const adminUser = await createUser(
    'admin@example.com',
    'Admin123!',
    'مشرف النظام',
    'ADMIN',
    'إدارة النظام'
  );

  const securityManagerUser = await createUser(
    'security@example.com',
    'Security123!',
    'مدير الأمن',
    'SECURITY_MANAGER',
    'الأمن السيبراني'
  );

  const departmentManagerUser = await createUser(
    'department@example.com',
    'Department123!',
    'مدير القسم',
    'DEPARTMENT_MANAGER',
    'تكنولوجيا المعلومات'
  );

  const regularUser = await createUser(
    'user@example.com',
    'User123!',
    'مستخدم عادي',
    'USER',
    'الموارد البشرية'
  );

  console.log('Database seeded with dummy users:');
  console.log('- Admin:', adminUser.email);
  console.log('- Security Manager:', securityManagerUser.email);
  console.log('- Department Manager:', departmentManagerUser.email);
  console.log('- Regular User:', regularUser.email);
}

async function createUser(
  email,
  password,
  name,
  role,
  department
) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    return existingUser;
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      department,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
