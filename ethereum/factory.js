
import web3 from './web3';
import RentFactory from './build/FactoryRent.json';

const instance = new web3.eth.Contract(
  JSON.parse(RentFactory.interface),
  '0x5B86a76987DaB5f698BD1Ff9fcC5E8a23D344E19'
);

export default instance;


//Previously Deployed Factory Contracts
//'0x69E14a2ed42d7346edE2749370E6508C7060b252'
//'0x0682930A824c7e0E912bA450106B08B9362f6be1'
//'0x41500454f71FaDaA4bB4AD43A35e196D511aee4c'
//'0xC37fd56d23a9cdf2b10C8136e8662bf5229F828D'
