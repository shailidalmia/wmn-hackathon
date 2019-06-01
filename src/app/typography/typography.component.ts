import { Component, OnInit, Query } from '@angular/core';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import * as Queries from '../query';
import {MatSnackBarModule, MatSnackBar} from '@angular/material/snack-bar';
import {  ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.css']
})
export class TypographyComponent implements OnInit {

  constructor(private apollo: Apollo, private data: DataService, private _snackBar: MatSnackBar) { }

  message: any;

  contest: any;
  // question: any;
  // answer: any;

  submitContest(answer: any){

    // console.log("submiited")
    // console.log(answer)
    // console.log(this.contest)
    // if(answer ===  this.contest.answer){
    //   console.log("True")
    // }
    // else {
    //   console.log("False")
    // }
    this.apollo.mutate<any>({
      mutation: Queries.AddSubmissionQuery,
      variables: {
        'objects':  [
          {
            'contest_id': this.contest.id,
            'account_id': 'dummy',
            'is_correct': (answer ===  this.contest.answer)
          }
        ]
      }
    }).subscribe(({ data }) => {}, (error)=>{
      //add toast
      console.log('Could not add cuz ' + error);
    })

    // openSnackBar() {
    //   this._snackBar.open('', '', {
    //     duration: 2000,
    //   });
    // }
  }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
    console.log("Message from typography ", this.message)
    // console.log("Message from typography ", typeof parseInt(this.message))
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

  }

}
