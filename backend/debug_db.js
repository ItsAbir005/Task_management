import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany();
  console.log('Departments:', JSON.stringify(departments, null, 2));
  const employees = await prisma.employee.findMany({
    include: { department: true }
  });
  console.log('Employees:', JSON.stringify(employees, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
