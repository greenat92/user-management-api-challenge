import { SeedHelper } from '../helpers/seed.helper'; // Adjust the import path as necessary
import { dataSource } from '../../src/config/database.config'; // Ensure this path is correct

const seedHelper = new SeedHelper(dataSource);

async function setup() {
  await seedHelper.initialize();

  // Seed initial data
  // await seedHelper.createUser(`testuser${Math.random() / 100}`, 'password');

  // Optionally update users if needed
  // await seedHelper.updateUser('testuser', 'newusername', 'newpassword');

  await seedHelper.destroy();
}

setup();
