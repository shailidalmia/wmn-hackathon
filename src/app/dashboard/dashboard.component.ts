import { Component, OnInit, Query, EventEmitter, Output } from '@angular/core';
import * as Chartist from 'chartist';
import Matic from 'maticjs'
import { config }from './config';
import { Apollo } from 'apollo-angular';
import * as Queries from '../query';
import { DataService } from '../data.service';
import {Subscription} from 'apollo-angular';
import { FeedGQL } from '../query-sub';
//declare const payToJoin: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  contests = []
  contest: any;
  participantCounts = {}
  feedGQL: any;

  constructor(private apollo: Apollo, private data: DataService, feedGQL: FeedGQL) {
      this.feedGQL = feedGQL
      this.initMatic();
      this.startCountdown(20)
   }

  startCountdown(seconds){
    var counter = seconds;
  
    var interval = setInterval(() => {
      console.log(counter);
      counter--;
      
  
      if(counter < 0 ){
        
        // The code here will run when
        // the timer has reached zero.
        
        clearInterval(interval);
        console.log('Ding!');
      };
    }, 1000);
  };
  

privatekeys = {
  '0x5d659380a95f32d6960b73C803B962d204c9584f': '0x13a41d93a304a12e0df873061c4fa68ab4dbe5753a4bcb9eb223045b5b81457d',
  '0x7C250149936Cfd91f6145963287A2F388DF9bA28': '0xd49fd22d55bac06e202ba752090746afecbc32e8d5a39beef726edb216f15ddc',
  '0xc27daa57faBC85884E63CC9A6EFf6591b39994aA': '0x1293e70e1d4457d4714b79995679d5448fd0f3c29eed8bd8dfcf96e368559433'
};


  matic = null

  // Create sdk instance
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

      //this.matic.wallet = '<private-key>' // your private key
    }
  }

  payToJoin(account, amount) {
    console.log(this.matic);
    const token = config.MATIC_TEST_TOKEN;
    const owner = config.OWNER_ADDRESS;

    this.matic.wallet = this.privatekeys[account]

    console.log("Token : " + token);
    console.log("Account : " + account);
    console.log("To receipient owner: " + owner + " for key: " + this.privatekeys[account]);

    this.matic.transferTokens(token, owner, amount, {
      from: account,
      onTransactionHash: hash => {
        // action on Transaction success
        // eslint-disable-next-line
        console.log(hash);
      },
    })
  }


  enterContest(id: any){
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
        console.log(this.contest)
      })

      console.log("dashboard ", this.contest)
    //payToJoin("0x7C250149936Cfd91f6145963287A2F388DF9bA28", 1000000000000000000);
    this.data.changeMessage(id);
    this.payToJoin("0x7C250149936Cfd91f6145963287A2F388DF9bA28", this.contest.price.toString());
        
  
  };
  startAnimationForLineChart(chart){
      let seq: any, delays: any, durations: any;
      seq = 0;
      delays = 80;
      durations = 500;

      chart.on('draw', function(data) {
        if(data.type === 'line' || data.type === 'area') {
          data.element.animate({
            d: {
              begin: 600,
              dur: 700,
              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
              to: data.path.clone().stringify(),
              easing: Chartist.Svg.Easing.easeOutQuint
            }
          });
        } else if(data.type === 'point') {
              seq++;
              data.element.animate({
                opacity: {
                  begin: seq * delays,
                  dur: durations,
                  from: 0,
                  to: 1,
                  easing: 'ease'
                }
              });
          }
      });

      seq = 0;
  };
  startAnimationForBarChart(chart){
      let seq2: any, delays2: any, durations2: any;

      seq2 = 0;
      delays2 = 80;
      durations2 = 500;
      chart.on('draw', function(data) {
        if(data.type === 'bar'){
            seq2++;
            data.element.animate({
              opacity: {
                begin: seq2 * delays2,
                dur: durations2,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
      });

      seq2 = 0;
  };
  ngOnInit() {
      /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

      this.apollo.watchQuery<any>({
        query: Queries.GetAllContestsQuery
      })
      .valueChanges
      .subscribe(({ data }) => {
        this.contests = data.Contest
        console.log(data.Contest)
        console.log(this.contests)
      })
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
     

      const dataDailySalesChart: any = {
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          series: [
              [12, 17, 7, 17, 23, 18, 38]
          ]
      };

     const optionsDailySalesChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      }

      var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(dailySalesChart);


      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

      const dataCompletedTasksChart: any = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
              [230, 750, 450, 300, 280, 240, 200, 190]
          ]
      };

     const optionsCompletedTasksChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
      }

      var completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // start animation for the Completed Tasks Chart - Line Chart
      this.startAnimationForLineChart(completedTasksChart);



      /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

      var datawebsiteViewsChart = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]

        ]
      };
      var optionswebsiteViewsChart = {
          axisX: {
              showGrid: false
          },
          low: 0,
          high: 1000,
          chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
      };
      var responsiveOptions: any[] = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      var websiteViewsChart = new Chartist.Bar('#websiteViewsChart', datawebsiteViewsChart, optionswebsiteViewsChart, responsiveOptions);

      //start animation for the Emails Subscription Chart
      this.startAnimationForBarChart(websiteViewsChart);
  };

 


}
