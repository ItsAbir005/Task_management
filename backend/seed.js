import prisma from './utils/client.js';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'admin@hrm.com';
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const tenant = await prisma.tenant.upsert({
        where: { email },
        update: {},
        create: {
            name: 'Test Tenant',
            email,
            password: hashedPassword,
            domain: 'test-hrm'
        }
    });

    // 3. Departments
    const engDept = await prisma.department.findFirst({
        where: { name: 'Engineering', tenantId: tenant.id }
    }) || await prisma.department.create({
        data: { name: 'Engineering', tenantId: tenant.id }
    });

    const hrDept = await prisma.department.findFirst({
        where: { name: 'Human Resources', tenantId: tenant.id }
    }) || await prisma.department.create({
        data: { name: 'Human Resources', tenantId: tenant.id }
    });

    // 4. Employees
    const employees = [
        { firstName: 'Alice', lastName: 'Manager', email: 'alice@hrm.com', role: 'MANAGER', deptId: engDept.id },
        { firstName: 'Bob', lastName: 'HR', email: 'bob@hrm.com', role: 'HR', deptId: hrDept.id },
        { firstName: 'Charlie', lastName: 'Dev', email: 'charlie@hrm.com', role: 'EMPLOYEE', deptId: engDept.id }
    ];

    const createdEmployees = [];
    for (const emp of employees) {
        const e = await prisma.employee.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                password: hashedPassword,
                role: emp.role,
                tenantId: tenant.id,
                departmentId: emp.deptId,
                salary: 60000,
                employmentType: 'FULL_TIME',
                status: 'ACTIVE'
            }
        });
        createdEmployees.push(e);
    }

    // 5. Projects
    const manager = createdEmployees.find(e => e.role === 'MANAGER');
    const project = await prisma.project.upsert({
        where: { id: 'test-project-id' },
        update: {},
        create: {
            id: 'test-project-id',
            name: 'Project Phoenix',
            client: 'Acme Corp',
            description: 'A top-secret modernization project',
            status: 'ONGOING',
            tenantId: tenant.id,
            managerId: manager.id,
            members: {
                connect: [{ email: 'charlie@hrm.com' }]
            }
        }
    });

    console.log('Seed completed successfully!');
    console.log('Admin Login: admin@hrm.com / password123');
    console.log('Manager Login: alice@hrm.com / password123');
    console.log('Project Created:', project.name);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
