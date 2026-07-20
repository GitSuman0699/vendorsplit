import { loadEnvConfig } from '@next/env';

// Load .env.local first
loadEnvConfig(process.cwd());

async function runTests() {
  console.log('🧪 Starting Pinch API Validation Tests...');
  
  // Dynamically import to ensure env variables are set when the module loads
  const { checkHealth, createManagedMerchant, createPaymentLink, createOrUpdatePayer } = await import('./lib/pinch');
  
  try {
    // Test 1: Health Check
    console.log('\n[Test 1] Health Check');
    const health = await checkHealth();
    console.log('Health Result:', health);
    
    // Test 2: Create Managed Merchant
    console.log('\n[Test 2] Create Managed Merchant');
    const merchant = await createManagedMerchant({
      companyName: 'VendorSplit Test Vendor',
      companyEmail: 'testvendor@example.com',
      bankBsb: '062000', // Valid test BSB
      bankAccountNumber: '12345678', // Valid test Acct
      bankAccountName: 'Test Vendor Pty Ltd',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactEmail: 'testvendor@example.com'
    });
    console.log('✅ Managed Merchant created successfully!');
    console.log(`Merchant ID: ${merchant.id}`);
    console.log(`Test Merchant ID: ${merchant.testMerchantId}`);
    
    // Pinch API might expect the base merchant ID in the header even in test mode
    const targetMerchantId = merchant.id;
    
    // Test 3: Create Payer for that merchant
    console.log(`\n[Test 3] Create Payer for merchant ${targetMerchantId}`);
    const payer = await createOrUpdatePayer({
      firstName: 'Jane',
      lastName: 'Smith',
      emailAddress: 'janesmith@example.com'
    }, targetMerchantId);
    console.log(`✅ Payer created! ID: ${payer.id}`);
    
    // Test 4: Create Payment Link on behalf of the merchant with an Application Fee
    console.log(`\n[Test 4] Create Payment Link for merchant ${targetMerchantId}`);
    const link = await createPaymentLink({
      amount: 1500, // $15.00
      description: 'VendorSplit Test Payment',
      payerId: payer.id,
      applicationFee: 150 // $1.50 commission for the organizer
    }, targetMerchantId);
    
    console.log('✅ Payment Link created successfully!');
    console.log(`Payment Link ID: ${link.id}`);
    console.log(`URL: ${link.url}`);
    
    console.log('\n🎉 All tests passed! The credentials are valid and the API is fully functional.');
    
  } catch (err) {
    console.error('\n❌ Test failed with exact error:', err);
  }
}

runTests();
