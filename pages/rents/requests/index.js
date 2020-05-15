//TODO: Form Validation

import React, { Component } from 'react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import RentContract from '../../../ethereum/rentContract';
import { Form, Button, Input, Message,Checkbox } from 'semantic-ui-react';
import web3 from '../../../ethereum/web3';
import { Router } from '../../../routes';

class RequestIndex extends Component {
  static async getInitialProps(props) {
    const rents = RentContract(props.query.rentalAddress);
    const summary = await rents.methods.getSummary().call();

    return {
      contractAddress: props.query.rentalAddress,
      managerAddress: summary[0],
      security: summary[1],
      availablity: summary[2],
      description: summary[3],
      popularity: summary[4],
      rentPerDay: summary[5],
      name: summary[6]
    };
  }

  state = {
    contractAddress: this.props.contractAddress,
    showName: this.props.name,
    minimumSecurity: this.props.security,
    description: this.props.description,
    rentPerDay: this.props.rentPerDay,
    errorMessage: '',
    loading: false,
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
    this.setState({ currentAddress: accounts[0] });
  }

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: '' });

    try {
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const rents = RentContract(this.state.contractAddress);
      await rents.methods
        .editDetails(this.state.showName,this.state.minimumSecurity,this.state.description,this.state.rentPerDay)
        .send({
          from: accounts[0]
        });
      Router.replaceRoute(`/rents/${this.props.contractAddress}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };
  render() {
    return (
      <Layout>
        <Link route={`/rents/${this.props.contractAddress}`}>
          <a>
            <Button secondary>Back</Button>
          </a>
        </Link>  
        <h3>Edit your vehicle details</h3>

        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Name of vehicle</label>
          <Input
            label="Short Name"
            labelPosition="right"
            value={this.state.showName}
            onChange={event =>
              this.setState({ showName: event.target.value })}
          />
        </Form.Field>
          <Form.Field>
            <label>Minimum Security Amount</label>
            <Input
              label="wei"
              labelPosition="right"
              value={this.state.minimumSecurity}
              onChange={event =>
                this.setState({ minimumSecurity: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Address and description of Vehicle</label>
            <Input
              label="Complete Details"
              labelPosition="right"
              value={this.state.description}
              onChange={event =>
                this.setState({ description: event.target.value })}
            />
          </Form.Field>
          <Form.Field>
            <label>Rent Per Day</label>
            <Input
              label="wei"
              labelPosition="right"
              value={this.state.rentPerDay}
              onChange={event =>
                this.setState({ rentPerDay: event.target.value })}
            />
          </Form.Field>
          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button 
          loading={this.state.loading} 
          disabled={this.props.managerAddress != this.state.currentAddress}
          primary>
            Edit!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default RequestIndex;
