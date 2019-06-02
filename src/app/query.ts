import gql from 'graphql-tag'

export const GetAllContestsQuery = gql`
query PostsGetQuery($is_active: Boolean){
Contest (
where: {is_active: {_eq: $is_active}}
){
id,
price,
is_active,
contest_name,
start_ts,
end_ts
}
}
`;

    export const updateContestQuery = gql`
    mutation updateMutation($contestID: Int!, $set: Contest_set_input!){
   update_Contest(
     where: {id: {_eq: $contestID}},
     _set: $set
   ) {
     affected_rows
     returning {
       is_active
     }
   }
 }
    `;

     
export const GetQuestionByContestQuery = gql`
query getQuestion($contestID: Int!) {
  Contest(
    where: {id: {_eq: $contestID}}
  ) {
    id,
    price,
    question,
    answer
  }
  }`;

export const AddSubmissionQuery = gql`
mutation insert_Submission($objects: [Submission_insert_input!]!){
    insert_Submission(objects: $objects){
      returning {
        contest_id,
        account_id,
        is_correct
      }
    }
  }
`;

export const GetAllSubmissionsQuery = gql`
query PostsGetQuery($contestID: Int!){
  Submission (
    where: {contest_id: {_eq: $contestID}}
  ){
    contest_id
    account_id
    is_correct
  }
}
`;

export const getAllParticipantsByContestQuery = gql`{
  subscription getParticipantCounts{
    agg_participant_data {
      contest_id
      count
    }
  }
}`