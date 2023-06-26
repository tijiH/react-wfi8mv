import React from 'react';
import Web3 from 'web3';
import ABI_JSON from './firefundFinanceABI.json' assert { type: 'json' };
import ABI_PRICE from './priceABI.json' assert { type: 'json' };
import { URLParams } from './urlparams.js';
URLParams.readURLData();

export default class FirefundValues extends React.Component {
  urlAddr = URLParams.getParam('addr');
  state = {
    loading: true,
    ffAddress: '0x2b1803f88b660294de17b2c3de919339db938969',
    useAddr: '0xF4195b0C52D78DFe57B45D947a2955e03c73448e',
    param: this.urlAddr,
  };

  async componentDidMount() {
    const RPC_BSC = 'https://bsc-dataseed1.binance.org/'; //binance smart chain
    const web3 = new Web3(RPC_BSC);
    const RPC_POL = 'https://polygon.llamarpc.com';
    const web3p = new Web3(RPC_POL);
    const RPC_FTM = 'https://fantom.publicnode.com';
    const web3f = new Web3(RPC_FTM);
    const RPC_ARB = 'https://arbitrum-one.public.blastapi.io';
    const web3a = new Web3(RPC_ARB);
    if (this.state.param) {
      this.state.useAddr = this.state.param.toString();
    } //if url param exists then use that as the default address to check
    web3.eth.defaultAccount = this.state.useAddr;
    web3p.eth.defaultAccount = this.state.useAddr;
    web3f.eth.defaultAccount = this.state.useAddr;
    web3a.eth.defaultAccount = this.state.useAddr;

    const myContract = new web3.eth.Contract(
      ABI_JSON,
      '0x2152aa45e02c1022cAB4ad964663fB3D69C2023e',
      {
        from: this.state.useAddr, // default from address
      }
    ); // create web3 contract object using ABI pulled from bscscan
    const polyContract = new web3p.eth.Contract(
      ABI_JSON,
      '0x8c351D4AB9922dF476384BeBdF45eCFC19782773',
      {
        from: this.state.useAddr,
      }
    ); //firefund polygon contract
    const polyPrice = new web3p.eth.Contract(
      ABI_PRICE,
      '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
      {
        from: this.state.useAddr,
      }
    ); //chainlink Matic price feed
    const ftmContract = new web3f.eth.Contract(
      ABI_JSON,
      '0xFB9D801bc58488a9Cb7FfBEdBB82350705c7e01d',
      {
        from: this.state.useAddr,
      }
    ); //firefund fantom contract
    const ftmPrice = new web3f.eth.Contract(
      ABI_PRICE,
      '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
      {
        from: this.state.useAddr,
      }
    ); //chainlink Fantom price feed
    const arbContract = new web3a.eth.Contract(
      ABI_JSON,
      '0x515579FB6F65EE38eb0E401725079a955a3281B8',
      {
        from: this.state.useAddr,
      }
    ); //firefund arbitrum price feed
    const arbPrice = new web3a.eth.Contract(
      ABI_PRICE,
      '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
      {
        from: this.state.useAddr,
      }
    ); //chainlink ethereum price feed
    const output = await myContract.methods.userInfo().call(); //call contract function which returns all stakes
    const pOut = await polyContract.methods.userInfo().call();
    const pPrice = (await polyPrice.methods.latestAnswer().call()) / 100000000;
    const fOut = await ftmContract.methods.userInfo().call();
    const fPrice = (await ftmPrice.methods.latestAnswer().call()) / 100000000;
    const aOut = await arbContract.methods.userInfo().call();
    const aPrice = (await arbPrice.methods.latestAnswer().call()) / 100000000;
    const rewards = await myContract.methods.calcdiv(this.state.useAddr).call();
    const pRew = await polyContract.methods.calcdiv(this.state.useAddr).call();
    const fRew = await ftmContract.methods.calcdiv(this.state.useAddr).call();
    const aRew = await arbContract.methods.calcdiv(this.state.useAddr).call();
    const totReward = Math.round(rewards / 10000000000000000) / 100;
    const pTotRew = Math.round(pRew / 10000000000000000) / 100;
    const fTotRew = Math.round(fRew / 10000000000000000) / 100;
    const aTotRew = Math.round(aRew / 10000000000000) / 100000;
    var total = 0;
    for (let i = 0; i < output.length; i++) {
      var initWithdrawn = output[i][4];
      var stakeAmt = output[i][2];
      if (!initWithdrawn) {
        total += parseInt(stakeAmt);
      }
    } // loop through all stakes and if not withdrawn, add to staked total
    const val = Math.round(total / 10000000000000000) / 100; //convert from wei

    var totP = 0;
    for (let i = 0; i < pOut.length; i++) {
      var initWithdrawn = pOut[i][4];
      var stakeAmt = pOut[i][2];
      if (!initWithdrawn) {
        totP += parseInt(stakeAmt);
      }
    } // loop through all stakes and if not withdrawn, add to staked total
    const valP = Math.round(totP / 10000000000000000) / 100; //convert from wei

    var totF = 0;
    for (let i = 0; i < fOut.length; i++) {
      var initWithdrawn = fOut[i][4];
      var stakeAmt = fOut[i][2];
      if (!initWithdrawn) {
        totF += parseInt(stakeAmt);
      }
    } // loop through all stakes and if not withdrawn, add to staked total
    const valF = Math.round(totF / 10000000000000000) / 100; //convert from wei

    var totA = 0;
    for (let i = 0; i < aOut.length; i++) {
      var initWithdrawn = aOut[i][4];
      var stakeAmt = aOut[i][2];
      if (!initWithdrawn) {
        totA += parseInt(stakeAmt);
      }
    } // loop through all stakes and if not withdrawn, add to staked total
    const valA = Math.round(totA / 100000000000000) / 10000; //convert from wei

    const refB = await myContract.methods.seeRefBonus().call();
    const refP = await polyContract.methods.seeRefBonus().call();
    const refF = await ftmContract.methods.seeRefBonus().call();
    const refA = await arbContract.methods.seeRefBonus().call();

    this.setState({ tRew: totReward, loading: false });
    this.setState({ tStake: val, loading: false });
    this.setState({ tRewP: pTotRew, loading: false });
    this.setState({
      tRewPUSD: Math.round(pTotRew * pPrice * 100) / 100,
      loading: false,
    });
    this.setState({ tStakeP: valP, loading: false });
    this.setState({
      tStakePUSD: Math.round(valP * pPrice * 100) / 100,
      loading: false,
    });
    this.setState({ tRewF: fTotRew, loading: false });
    this.setState({
      tRewFUSD: Math.round(fTotRew * fPrice * 100) / 100,
      loading: false,
    });
    this.setState({ tStakeF: valF, loading: false });
    this.setState({
      tStakeFUSD: Math.round(valF * fPrice * 100) / 100,
      loading: false,
    });
    this.setState({ tRewA: aTotRew, loading: false });
    this.setState({
      tRewAUSD: Math.round(aTotRew * aPrice * 100) / 100,
      loading: false,
    });
    this.setState({ tStakeA: valA, loading: false });
    this.setState({
      tStakeAUSD: Math.round(valA * aPrice * 100) / 100,
      loading: false,
    });
    this.setState({
      tRefB: Math.round(refB / 10000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefP: Math.round(refP / 10000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefPUSD: Math.round((refP * pPrice) / 10000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefF: Math.round(refF / 10000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefFUSD: Math.round((refF * fPrice) / 100000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefA: Math.round(refA / 10000000000000000) / 100,
      loading: false,
    });
    this.setState({
      tRefAUSD: Math.round((refA * aPrice) / 10000000000000000) / 100,
      loading: false,
    });
  }

  handleChange = (e) => {
    this.setState({ ffAddress: e.target.value });
  };
  handleClick = async () => {
    await this.setState({ useAddr: this.state.ffAddress });
    await this.setState({ param: '' });
    await this.componentDidMount();
  };
  render() {
    if (this.state.loading) {
      return (
        <div>
          <br></br>
          <div>loading . . .</div>
        </div>
      );
    }

    return (
      <div style={{ 'text-align': 'center' }}>
        <h2>Firefund</h2>
        <style>
          {
            'table.styled-table{border-collapse:collapse;margin:25px auto;font-size:0.9em;font-family:sans-serif;min-width:400px;box-shadow:0 0 20px rgba(0,0,0,0.15);}table.styled-table thead tr{background-color:#009879;color:#ffffff;text-align:left;}table.styled-table th,table.styled-table td{padding:20px;}table.styled-table tbody tr{border-bottom:1px solid #dddddd;}table.styled-table tbody tr:nth-of-type(even){background-color:#f3f3f3;}table.styled-table tbody tr:last-of-type{border-bottom:2px solid #009879;}table.styled-table tbody tr.active-row{font-weight:bold;color:#009879;} .underline{text-decoration: underline;}'
          }
        </style>
        <table class="styled-table">
          <tr>
            <th class="underline">Chain</th>
            <th class="underline">Current Staked</th>
            <th class="underline">Current Rewards</th>
            <th class="underline">Current Ref Bonus</th>
          </tr>
          <tr>
            <td class="underline">Binance</td>
            <td>{this.state.tStake} BUSD</td>
            <td>{this.state.tRew} BUSD</td>
            <td>{this.state.tRefB} BUSD</td>
          </tr>
          <tr>
            <td class="underline">Polygon</td>
            <td>
              {this.state.tStakeP} MATIC ({this.state.tStakePUSD} $)
            </td>
            <td>
              {this.state.tRewP} MATIC ({this.state.tRewPUSD} $)
            </td>
            <td>
              {this.state.tRefP} MATIC ({this.state.tRefPUSD} $)
            </td>
          </tr>
          <tr>
            <td class="underline">Fantom</td>
            <td>
              {this.state.tStakeF} FTM ({this.state.tStakeFUSD} $)
            </td>
            <td>
              {this.state.tRewF} FTM ({this.state.tRewFUSD} $)
            </td>
            <td>
              {this.state.tRefF} FTM ({this.state.tRefFUSD} $)
            </td>
          </tr>
          <tr>
            <td class="underline">Arbitrum</td>
            <td>
              {this.state.tStakeA} ETH ({this.state.tStakeAUSD} $)
            </td>
            <td>
              {this.state.tRewA} ETH ({this.state.tRewAUSD} $)
            </td>
            <td>
              {this.state.tRefA} ETH ({this.state.tRefAUSD} $)
            </td>
          </tr>
          <tr>
            <th class="underline">TOTAL</th>
            <th>
              {Math.round(
                (this.state.tStake +
                  this.state.tStakePUSD +
                  this.state.tStakeFUSD +
                  this.state.tStakeAUSD) *
                  100
              ) / 100}{' '}
              $
            </th>
            <th>
              {Math.round(
                (this.state.tRew +
                  this.state.tRewPUSD +
                  this.state.tRewFUSD +
                  this.state.tRewAUSD) *
                  100
              ) / 100}{' '}
              $
            </th>
            <th>
              {Math.round(
                (this.state.tRefB +
                  this.state.tRefPUSD +
                  this.state.tRefFUSD +
                  this.state.tRefAUSD) *
                  100
              ) / 100}{' '}
              $
            </th>
          </tr>
        </table>
        <h2> Yield estimé </h2>
        <a>
          {Math.round(
            (this.state.tStake +
              this.state.tStakePUSD +
              this.state.tStakeFUSD +
              this.state.tStakeAUSD) *
              100 *
              0.15
          ) / 100}
        </a>
        <br></br>
        <br></br>
      </div>
    );
  }
}
