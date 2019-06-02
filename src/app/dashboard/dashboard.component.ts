import { Component, OnInit, Query, EventEmitter, Output } from '@angular/core';
import * as Chartist from 'chartist';
import Matic from 'maticjs'
import { config }from './config';
import { Apollo } from 'apollo-angular';
import Web3 from 'web3';
import * as Queries from '../query';
import { DataService } from '../data.service';

declare let window: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  contests = []
  web3Provider = null
  account = null

  constructor(private apollo: Apollo, private data: DataService) {  
      if (typeof window.web3 !== 'undefined') {
        this.web3Provider = window.web3.currentProvider;
      } else {
        this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      window.web3 = new Web3(this.web3Provider);
   }

  matic = null

  initMatic() {
    if (!this.matic) {
      this.matic = new Matic({
        maticProvider: config.MATIC_PROVIDER,
        parentProvider: config.PARENT_PROVIDER,
        rootChainAddress: config.ROOTCHAIN_ADDRESS,
        maticWethAddress: config.MATICWETH_ADDRESS,
        syncerUrl: config.SYNCER_URL,
        watcherUrl: config.WATCHER_URL,
        withdrawManagerAddress: config.WITHDRAWMANAGER_ADDRESS,  
      })

    }
  }

  payToJoin(account, amount) {
    console.log("In pay to join " + this.matic);
    const token = config.MATIC_TEST_TOKEN;
    const owner = config.OWNER_ADDRESS;

    this.getInfo()
    console.log('here is your account', this.account, this.matic, this.privatekeys ,this.privatekeys[this.account]);

    this.matic.wallet = this.privatekeys[this.account]

    console.log("Token : " + token);
    console.log("Account : " + this.account);
    console.log("To receipient owner: " + owner + " for key: " + this.privatekeys[this.account.toLowerCase()]);

    this.matic.transferTokens(token, owner, amount, {
      from: this.account,
      onTransactionHash: hash => {
        // action on Transaction success
        // eslint-disable-next-line
        console.log(hash);
      },
    })
  }

  getInfo() {
      this.account = window.web3.eth.givenProvider.selectedAddress;
  }


  enterContest(id: any){
    console.log(id)
    this.payToJoin("0x7C250149936Cfd91f6145963287A2F388DF9bA28", '1000000000000000');
    this.data.changeMessage(id);    
  
  };

  ngOnInit() {
      this.apollo.watchQuery<any>({
        query: Queries.GetAllContestsQuery
      })
      .valueChanges
      .subscribe(({ data }) => {
        this.contests = data.Contest
        console.log(data.Contest)
        console.log(this.contests)
      })
      this.initMatic();
  };

  privatekeys = {
  '0x5d659380a95f32d6960b73c803b962d204c9584f': '0x13a41d93a304a12e0df873061c4fa68ab4dbe5753a4bcb9eb223045b5b81457d',
  '0x7c250149936cfd91f6145963287a2f388df9ba28': '0xd49fd22d55bac06e202ba752090746afecbc32e8d5a39beef726edb216f15ddc',
  '0xc27daa57fabc85884e63cc9a6eff6591b39994aa': '0x1293e70e1d4457d4714b79995679d5448fd0f3c29eed8bd8dfcf96e368559433'
};

}
