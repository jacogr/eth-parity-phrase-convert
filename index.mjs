import ethutil from 'ethereumjs-util';
import createKeccakHash from 'keccak';

function createSha3Buffer (value) {
  return createKeccakHash('keccak256').update(value).digest();
}

function createSha3Raw (value) {
  return createSha3Buffer(value).toString('hex');
}

function formatAddress (_address) {
  const address = _address.replace('0x', '').toLowerCase();

  const hash = createSha3Raw(address);
  let result = '';

  for (let index = 0; index < 40; index++) {
    result = `${result}${parseInt(hash[index], 16) > 7 ? address[index].toUpperCase() : address[index]}`;
  }

  return `0x${result}`;
}

function fromBytesToHex (bytes) {
  return `0x${Buffer.from(bytes).toString('hex')}`;
}

function walletFromPrivateKey (privateKey, checkZero) {
  const publicBuf = ethutil.privateToPublic(privateKey).slice(-64);
  const addressBuf = ethutil.publicToAddress(publicBuf).slice(-40);

  if (!checkZero || !addressBuf[0]) {
    return {
      address: formatAddress(fromBytesToHex(addressBuf)),
      privateKey
    };
  }

  return null;
}

function walletFromPhrase (phrase) {
  let wallet = {};
  let count = 16384;
  let privateKey = createSha3Buffer(phrase);

  while (count--) {
    privateKey = createSha3Buffer(privateKey);
  }

  while (!wallet.privateKey) {
    privateKey = createSha3Buffer(privateKey);
    wallet = walletFromPrivateKey(privateKey, true) || {};
  }

  return wallet;
}

const wallet = walletFromPhrase(process.argv.slice(2).join(' '));

if (wallet) {
  console.log('address:', wallet.address);
  console.log('private:', fromBytesToHex(wallet.privateKey));
} else {
  console.error('ERROR: No wallet created')
}
