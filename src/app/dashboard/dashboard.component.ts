import { Component, OnInit, Query, EventEmitter, Output } from '@angular/core';
import * as Chartist from 'chartist';
import Matic from 'maticjs'
import { config } from './config';
import { Apollo } from 'apollo-angular';
import Web3 from 'web3';
import * as Queries from '../query';
import { DataService } from '../data.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

declare let window: any;
import {Subscription} from 'apollo-angular';

import { FeedGQL } from '../query-sub';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  contests = []

  web3Provider = null
  account = null

  contest: any;
  participantCounts = {}
  feedGQL: any;
  date: any;
  contestToCountDownMap = {}
  contestToCountDownMapSeconds = {} 

  constructor(private apollo: Apollo, private data: DataService, feedGQL: FeedGQL, private _snackBar: MatSnackBar) {
    if (typeof window.web3 !== 'undefined') {
      this.web3Provider = window.web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    window.web3 = new Web3(this.web3Provider);

    this.feedGQL = feedGQL
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

  payToJoin(amount) {
    console.log("In pay to join " + this.matic);
    const token = config.MATIC_TEST_TOKEN;
    const owner = config.OWNER_ADDRESS;

    this.getInfo()
    console.log('here is your account', this.account, this.matic, this.privatekeys ,this.privatekeys[this.account]);

    this.matic.wallet = this.privatekeys[this.account.toLowerCase()]

    console.log("Token : " + token);
    console.log("Account : " + this.account);
    console.log("To receipient owner: " + owner + " for key: " + this.privatekeys[this.account.toLowerCase()]);

    this.matic.transferTokens(token, owner, amount, {
      from: this.account,
      onTransactionHash: hash => {
        // action on Transaction success
        // eslint-disable-next-line
        console.log(hash);
        this._snackBar.open('Congratulations! You have entered the contest. Receipt: ' + hash, 'Done', {
          duration: 5000,
        });
      },
    })
  }

  getInfo() {
    this.account = window.web3.eth.givenProvider.selectedAddress;
  }


  enterContest(id: any) {
    console.log(id)

    this.apollo.watchQuery<any>({
      query: Queries.GetQuestionByContestQuery,
      variables: {
        'contestID': id
      }

    })
    .valueChanges
    .subscribe(({ data }) => {
      this.contest = data.Contest[0]
      console.log("dashboard ", this.contest)
      this.data.changeMessage(id);
      this.payToJoin(((this.contest.price)* 1000000000000000000).toString());

    })
  };
  
  // formatDate(arg0: number): any {
    //   return 
    // }

    formatDate (totalSeconds:any) {
      var hours   = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      seconds = Math.round(seconds * 100) / 100

      var result = (hours < 10 ? "0" + hours : hours);
      result += ":" + (minutes < 10 ? "0" + minutes : minutes);
      result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
      return result;
    }

    ngOnInit() {

      this.apollo.watchQuery<any>({
        query: Queries.GetAllContestsQuery,
        variables: {
          'is_active': true
        }
      }).valueChanges
      .subscribe(({ data }) => {
        this.contests = data.Contest
        console.log(data.Contest)
        console.log(this.contests)
        console.log(this.contests[0].end_ts - Date.now())
      })

      this.initMatic();

      this.feedGQL.watch()
      .valueChanges
      .subscribe(result => {
        result.data['agg_participant_data'].forEach(pair => {
          this.participantCounts[pair.contest_id] = pair.count
        });
        console.log(this.participantCounts)
      })
      // this.participantCount = this.apollo.subscribe({
        //   query: Queries.getAllParticipantsByContestQuery
        // })
        // .subscribe(({ data }) => {
          //   console.log(data)
          // });


          this.date = new Date();

          // this.distributeRewards();

          setInterval(() => {
            this.date = new Date();
            this.contests.filter(x => x.is_active).forEach(contest => {
              // console.log("helloo")
              // console.log(contest.end_ts)
              // console.log(Date.now())
              let end_dt = new Date(contest.end_ts)
              let mil = end_dt.getTime();
              this.contestToCountDownMap[contest.id] = this.formatDate(Math.round((mil - Date.now())/1000))
              this.contestToCountDownMapSeconds[contest.id]=(Math.round((mil - Date.now())/1000))
              if(contest.is_active === true && this.contestToCountDownMapSeconds[contest.id] <= 0){
                contest.end_dt = null;

                this.apollo.mutate<any>({
                  mutation: Queries.updateContestQuery,
                  variables: {
                    'contestID': contest.id,
                    'set':
                    {
                      'is_active': false
                    }
                  }
                }).subscribe(({ data }) => {
                  console.log("update ", data)
                  this.distributeRewards(contest);
                }, (error) => {
                  console.log('Update failed due to: ' + error)
                })
                contest.is_active = false
              }
            });
          }, 1000);
        };

     distributeRewards(contest: any) {
    // distributeRewards() {
        // query submissions table

        if(!contest.is_active)
        this.apollo.watchQuery<any>({
          query: Queries.GetAllSubmissionsQuery,
          variables: {
            'contestID': contest.id
          }
        }).valueChanges
        .subscribe(({ data }) => {
          const submissions = data.Submission;
          const sum = submissions.length * contest.price;
          const winners = submissions.filter(x => x.is_correct).length;
          if(winners != 0) {
            const reward = sum / winners
            console.log("hdhavhsv" , data)
            submissions.filter(x => x.is_correct).forEach(sub => {
              this.transferRewards(sub.account_id, reward);
            })
          }
          
        })


        //get sum to be divided.
        // for loop - transfer rewards 
        //this.transferRewards('0xc27daa57fabc85884e63cc9a6eff6591b39994aa', '1000000000000000000')
      }

        transferRewards(account, amount) {
          console.log("In distribute rewards " + this.matic);
          const token = config.MATIC_TEST_TOKEN;
          const owner = config.OWNER_ADDRESS;

          this.matic.wallet = this.privatekeys[owner]

          console.log("Token : " + token);

          this.matic.transferTokens(token, account, amount, {
            from: owner,
            onTransactionHash: hash => {
              // action on Transaction success
              // eslint-disable-next-line
              console.log(hash);
            },
          })
        };

        privatekeys = {
          '0x5d659380a95f32d6960b73c803b962d204c9584f': '0x13a41d93a304a12e0df873061c4fa68ab4dbe5753a4bcb9eb223045b5b81457d',
          '0x7c250149936cfd91f6145963287a2f388df9ba28': '0xd49fd22d55bac06e202ba752090746afecbc32e8d5a39beef726edb216f15ddc',
          '0xc27daa57fabc85884e63cc9a6eff6591b39994aa': '0x1293e70e1d4457d4714b79995679d5448fd0f3c29eed8bd8dfcf96e368559433'
        };


      }
