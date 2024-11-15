const bcrypt = require('bcrypt');

async function testBcrypt() {
    const plainPassword = 'yourpassword';
    console.log(`Plain password: ${plainPassword}`);

    const hash = await bcrypt.hash(plainPassword, 10);
    console.log(`Generated hash: ${hash}`);

    const isMatch = await bcrypt.compare(plainPassword, hash);
    console.log(`Password match result: ${isMatch}`);
}

testBcrypt();