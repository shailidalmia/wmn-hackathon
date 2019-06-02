import { Component, OnInit, Query } from '@angular/core';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import * as Queries from '../query';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ViewEncapsulation } from '@angular/core';
declare let window: any;

@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.css']
})
export class TypographyComponent implements OnInit {

  constructor(private apollo: Apollo, private data: DataService, private _snackBar: MatSnackBar) { 
  }

  message: any;

  contest: any;
  // question: any;
  // answer: any;

  submitContest(answer: any) {

console.log("In TYPO" , window.web3);
    let flag = false
    this.apollo.mutate<any>({
      mutation: Queries.AddSubmissionQuery,
      variables: {
        'objects': [
          {
            'contest_id': this.contest.id,
            'account_id': window.web3.eth.givenProvider.selectedAddress,
            'is_correct': (answer === this.contest.answer)
          }
        ]
      }
    }).subscribe(({ data }) => { 
      this.openSnackBar(flag, answer)
    }, (error) => {
      flag = true
      this._snackBar.open('You cannot attempt the same contest twice.', 'Done', {
        duration: 5000,
      });
      this.openSnackBar(flag, answer)
    })


    // this._snackBar.open('hello', 'bye', {
    //   duration: 2000,
    // });
  }
  openSnackBar(flag: boolean, answer: any) {
    
    if(flag === false){
      if (answer === this.contest.answer) {
        this._snackBar.open('Congratulations, correct answer! Your prize will be deposited to your account after the contest ends.', 'Done', {
          duration: 5000,
        });
      }
      else {
        this._snackBar.open('Oops, wrong answer!', 'Done', {
          duration: 5000,
        });
      }
    }
    
  }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => {
      this.message = message
          this.apollo.watchQuery<any>({
      query: Queries.GetQuestionByContestQuery,
      variables: {
        'contestID': this.message
      }

    })
      .valueChanges
      .subscribe(({ data }) => {
        this.contest = data.Contest[0]
        console.log(this.contest)
      })

    console.log(this.contest)
    })
    console.log("Message from typography ", this.message)
    // console.log("Message from typography ", typeof parseInt(this.message))


  }



}
