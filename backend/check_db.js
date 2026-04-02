import prisma from './utils/client.js';

async function main() {
    console.log('--- DATABASE STATUS ---');

    const tenantCount = await prisma.tenant.count();
    console.log(`Tenants: ${tenantCount}`);

    if (tenantCount > 0) {
        const tenants = await prisma.tenant.findMany({ take: 5 });
        console.table(tenants.map(t => ({ id: t.id, name: t.name, email: t.email })));
    }

    const employeeCount = await prisma.employee.count();
    console.log(`Employees: ${employeeCount}`);

    if (employeeCount > 0) {
        const employees = await prisma.employee.findMany({ take: 5 });
        console.table(employees.map(e => ({ id: e.id, email: e.email, firstName: e.firstName })));
    }

    const deptCount = await prisma.department.count();
    console.log(`Departments: ${deptCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
