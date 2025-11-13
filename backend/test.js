console.log('Testing all required modules...');

const modules = [
  'express',
  'mongoose', 
  'cors',
  'dotenv',
  'bcryptjs',
  'jsonwebtoken',
  'express-validator'
];

modules.forEach(moduleName => {
  try {
    require(moduleName);
    console.log(`✅ ${moduleName} - OK`);
  } catch (error) {
    console.log(`❌ ${moduleName} - FAILED: ${error.message}`);
  }
});