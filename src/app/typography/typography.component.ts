import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Apollo } from 'apollo-angular';
import * as Queries from '../query';

@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.css']
})
export class TypographyComponent implements OnInit {

  constructor(private apollo: Apollo, private data: DataService) { }

  message: string;
 
    contest: any;
    question: any;
    answer: any;

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
    console.log("Message from typography ", this.message)
    this.apollo.watchQuery<any>({
      query: Queries.GetQuestionByContestQuery,
      variables: {
        "contestID" : this.message
      }
    })
    .valueChanges
    .subscribe(({ data }) => {
      this.contest = data.Contest
      console.log(data.Contest)
      console.log(this.contest)
    })
    
  }

}
