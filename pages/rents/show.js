//TODO: 1.Firebase Stuff needs to be removed (or replaced)

import React ,{ Component } from 'react';
import { Form,Button,Card,Message,Grid, GridColumn } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import RentContract from '../../ethereum/rentContract';
import web3 from '../../ethereum/web3';
import TakeOnRentForm from '../../components/TakeOnRentForm';
import factory from '../../ethereum/factory'
import { Link } from '../../routes';
import { Router } from '../../routes';

class RentShow extends Component {

  static async getInitialProps(props) {

    const rents = RentContract(props.query.rentalAddress);
    const summary = await rents.methods.getSummary().call();
    let currentLessor = await rents.methods.getCurrentLessor().call();

    return {
      currentLessorAddress: currentLessor,
      contractAddress: props.query.rentalAddress,
      managerAddress: summary[0],
      security: summary[1],
      availability: summary[2],
      description: summary[3],
      popularity: summary[4],
      rentPerDay: summary[5],
      name: summary[6]
    };
  }
  state = {
    buttonLoading:false,
    messageError:'',
    buttonLoading2:false,
    messageError2:'',
    latitude:'',
    longitude:'',
    currentAddress:''
  };

  componentDidMount = async () => {
    await ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    this.setState({currentAddress: accounts[0]});
    console.log(accounts[0]);
    console.log(this.state.currentAddress);
  }

  componentDidUpdate = async () => {
    await ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    this.setState({currentAddress: accounts[0]});
  }

  checkavail(availability){
    if(availability == 1){
      return <span style={{color: 'green'}}>Vehicle Available</span>;
    }
    else if(!availability){
      return <span style={{color: 'red'}}>Vehicle on Rent</span>;
    }
    else{
      return <span style={{color: 'red'}}>Vehicle under Maintenance</span>;
    }
  }

  renderCards() {
    const {
      contractAddress,
      managerAddress,
      security,
      availability,
      description,
      popularity,
      rentPerDay,
      name
    } = this.props;

    const items = [
      {
        header: managerAddress,
        meta: 'Address of Manager',
        description:
          'The manager is owner and the lessor(rentee) of the vehicle',
        style: { overflowWrap: 'break-word' }
      },
      {
        header: 'Security Amount',
        meta:
          'You must give at least this much wei to rent this vehicle',
        description:
        'Minimum security to pay (wei) : ' + security
      },
      {
        header: 'availability',
        meta: '',
        description: this.checkavail(availability)
      },
      {
        header: 'Details',
        meta: 'Given below are complete details of the vehicle',
        description: description
      },
      {
        header: 'Popularity',
        description: 'Number of times the vehicle has been rented : ' +  popularity
      },
      {
        header: 'Rent per Day',
        meta:'' ,
        description: rentPerDay + ' wei'
      }
    ];

    return <Card.Group items={items} />;
  }

  onSubmitForm = async event => {
    event.preventDefault();

    this.setState({  messageError: '', messageError2: '', buttonLoading: true });

    try {
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
        await factory.methods
        .deleteRent(this.props.contractAddress)
        .send({
          from: accounts[0]
        });
      Router.replaceRoute('/');
    } catch (err) {
      this.setState({ messageError: err.message });
    }

    this.setState({ buttonLoading: false });
  };

  onSubmitTime = async event => {
    event.preventDefault();

    this.setState({ buttonLoading: true, messageError: '', messageError2: '' });

    try {
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const rent = RentContract(this.props.contractAddress);
      const tmp = await rent.methods.rentingTime().call();
      const timelimit = (new Date(Number(tmp))).getTime();
      if(timelimit>Date.now()){
      await rent.methods
        .returnSecurity()
        .send({
          from: accounts[0]
        });
      }
      else{
        const deductamount = parseInt((Date.now()-timelimit)/(60000));
        await rent.methods
          .cutSecurity(deductamount)
          .send({
            from: accounts[0]
          });
      }
      Router.replaceRoute(`/rents/${this.props.contractAddress}`);
    } catch (err) {
      this.setState({ messageError2: err.message });
    }

    this.setState({ buttonLoading: false });
  };

  takeOnMaintenance = async event => {
    event.preventDefault();

    this.setState({ buttonLoading2: true, messageError: '', messageError2: '' });

    try{
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const rent = RentContract(this.props.contractAddress);
      await rent.methods
        .takeOnMaintenance()
        .send({
          from: accounts[0]
        });
        Router.replaceRoute(`/rents/${this.props.contractAddress}`);
    } catch (err) {
      this.setState({ messageError: err.message });
    } 
    this.setState({ buttonLoading2: false});
  }

  returnFromMaintenance = async event => {
    event.preventDefault();

    this.setState({ buttonLoading2: true, messageError: '', messageError2: '' });

    try{
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const rent = RentContract(this.props.contractAddress);
      await rent.methods
        .returnFromMaintenance()
        .send({
          from: accounts[0]
        });
        Router.replaceRoute(`/rents/${this.props.contractAddress}`);
    } catch (err) {
      this.setState({ messageError: err.message });
    } 
    this.setState({ buttonLoading2: false});
  }

  renderCheck(){
    if(!this.props.availability){
      return(
        <Grid.Column style={{color:'red'}}>
          <h3>Can not edit right now, vehicle is on rent</h3>
        </Grid.Column>
      );
    }
    else if(this.props.availability == 1){
      if(this.state.currentAddress != this.props.managerAddress){
        return(
          <Grid.Column>
            <Button primary disabled>Edit Details</Button>
            <Button primary disabled>Take on Maintenance</Button>
            <Button negative disabled>Unlist Vehicle</Button>
          </Grid.Column>
        );
      }
      else{
        return(
          <Grid.Column>
            <Form  error={!!this.state.messageError}>
              <Link route={`/rents/${this.props.contractAddress}/requests`}>
                <a>
                  <Button primary>Edit Details</Button>
                </a>
              </Link>
              <Button 
              primary
              loading={this.state.buttonLoading2} 
              onClick={this.takeOnMaintenance}>Take on Maintenance</Button>
              <Button 
              loading={this.state.buttonLoading} 
              negative 
              onClick={this.onSubmitForm}>
                Unlist Vehicle
              </Button>
              <Message error header="Oops!" content={this.state.messageError} />
            </Form>
          </Grid.Column>
        );
      }
    }
    else{
      if(this.state.currentAddress != this.props.managerAddress){
        return(
          <Grid.Column>
            <Button primary disabled>Edit Details</Button>
            <Button primary disabled>Return from Maintenance</Button>
            <Button negative disabled>Unlist Vehicle</Button>
          </Grid.Column>
        );
      }
      else{
        return(
          <Grid.Column>
            <Form  error={!!this.state.messageError}>
              <Link route={`/rents/${this.props.contractAddress}/requests`}>
                <a>
                  <Button primary>Edit Details</Button>
                </a>
              </Link>
              <Button 
              primary
              loading={this.state.buttonLoading2} 
              onClick={this.returnFromMaintenance}>Return from Maintenance</Button>
              <Button 
              loading={this.state.buttonLoading} 
              negative 
              onClick={this.onSubmitForm}>
                Unlist Vehicle
              </Button>
              <Message error header="Oops!" content={this.state.messageError} />
            </Form>
          </Grid.Column>
        );
      }
    }
  }

  renderColumn(){
    if(this.props.availability == 1){
      return (
      <Grid.Column width={6}>
        <TakeOnRentForm address={this.props.contractAddress} rentPerDay={this.props.rentPerDay} security={this.props.security} />
      </Grid.Column>
    );
    }
    else if(this.props.availability == -1){
      return(
        <Grid.Column width={6} style={{color: 'red'}}>
          <h3>Can not rent right now, vehicle is under maintenance</h3>
        </Grid.Column>
      )
    }
    else{
      return(
      <Grid.Column width={6}>
      <Form onSubmit={this.onSubmitTime} error={!!this.state.messageError2}>
        <Message error header="Oops!" content={this.state.messageError2} />
        <Button 
        loading={this.state.buttonLoading} 
        disabled={this.state.currentAddress != this.props.currentLessorAddress}
        secondary  >Request Security Fee</Button>
      </Form>
      </Grid.Column>
    );
    }
  }

  render(){
    let lat = "24.5675";
    let long = "57.8234";
    let location_link = "https://www.google.com/maps/place/"+lat+","+long;

    return (
      <Layout>
        <h3>{this.props.name}</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>
            {this.renderColumn()}
          </Grid.Row>
          <Grid.Row>
            {this.renderCheck()}
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
            <a href={location_link} target="_blank">
              <Button>Get Location</Button>
            </a>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default RentShow;
