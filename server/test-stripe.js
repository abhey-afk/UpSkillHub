require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
  console.log('Testing Stripe Configuration...\n');
  
  // Check if API key is set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not set in .env file');
    return;
  }
  
  console.log('✅ STRIPE_SECRET_KEY is set');
  console.log('Key starts with:', process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...');
  
  try {
    // Try to create a test checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Test Course',
              description: 'This is a test course',
            },
            unit_amount: 100000, // ₹1000 in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    
    console.log('\n✅ Successfully created test Stripe Checkout Session');
    console.log('Session ID:', session.id);
    console.log('Session URL:', session.url);
    console.log('\n✅ Stripe is configured correctly!');
    
  } catch (error) {
    console.error('\n❌ Error creating Stripe session:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.type);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Authentication failed. Please check your STRIPE_SECRET_KEY');
    }
  }
}

testStripe();
