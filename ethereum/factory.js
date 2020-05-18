import web3 from './web3';
import RentFactory from './build/FactoryRent.json';

const instance = new web3.eth.Contract(
  JSON.parse(RentFactory.interface),
  '0x7a0BC5182a3bc6c0F03D86Db407f767F42d67177'
);

export default instance;
