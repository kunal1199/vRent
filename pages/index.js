import React, { Component } from 'react';
import { Card, Button } from 'semantic-ui-react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link } from '../routes';
import RentContract from '../ethereum/rentContract';
import Spinner from '../components/Spinner/Spinner';

class RentContractIndex extends Component {
  state = {
    loading: true
  }
  componentWillMount() {
    this.setState({loading: true});
  }
  componentDidMount() {
    this.setState({loading: false});
  }
  static async getInitialProps() {
    const listOfRents = await factory.methods.returnDeployedList().call();
    const promiseArray = listOfRents.map(async (address) => {
      const rent = RentContract(address);
      const valueofpopularity = await rent.methods.popularity().call();
      const valueofname = await rent.methods.getName().call();
      const valueofavailablity = await rent.methods.availablity().call();
      const valueofrentPerDay = await rent.methods.rentPerDay().call();
      return {
        keys: "values",
        addr: address,
        name: valueofname,
        availablity: valueofavailablity,
        popularity: valueofpopularity,
        rentPerDay: valueofrentPerDay
      };
    });
    const finalresults = await Promise.all(promiseArray);
    console.log(finalresults);
    return { finalresults };
  }
  giveAvailability(check){
    if(check){
      return "Available";
    }
    else{
      return "Unavailable";
    }
  }
  getColor(check){
    if(check){
      return "green";
    }
    else{
      return "red";
    }
  }
  renderRentContracts() {
    const items = this.props.finalresults.map((result) => {
      return {
        header: <React.Fragment>
          <div style={{fontSize: '24px', color:'black'}}><Link route={`/rents/${result.addr}`} ><a><h1>{result.name}</h1></a></Link></div>
          <div style={{fontSize: '24px', color:'black', position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)'}}>Rent per day - {result.rentPerDay} wei</div>
        </React.Fragment>,
        description: (
          <div style={{color: this.getColor(result.availablity), fontSize: '20px'}}>
          <br></br>
          Vehicle  {this.giveAvailability(result.availablity)}
          <br></br><br></br>
          <Link route={`/rents/${result.addr}`} >
            <a>Check Details</a>
          </Link>
          </div>
        ),
        meta:<div style={{fontSize: '16px', color:'maroon'}}>Popularity of Vehicle - {result.popularity}</div>,
        fluid: true,
        key: result.addr
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    let contents = (<div>
                        <h3 style={{ marginTop: '50px' }}>Registered Vehicles</h3>
                        <Link route="/rents/new">
                          <a>
                            <Button
                              content="Rent Your Vehicle"
                              floated="right" 
                              icon="add circle"
                              secondary
                            />
                          </a>
                        </Link>
                        <div style={{cursor: 'default'}}>
                          {this.renderRentContracts()}
                        </div>
                      </div>);
    if(this.state.loading) {
      contents=<Spinner/>
    }
    return (
      <Layout>
        {contents}
      </Layout>
    );
  }
}

export default RentContractIndex;
