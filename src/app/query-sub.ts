
import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable()
export class FeedGQL extends Query {
  document = gql`
    query Feed {
      agg_participant_data {
        contest_id
        count
      }
    }
  `
}