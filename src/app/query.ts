import gql from 'graphql-tag'

export const GetAllContestsQuery = gql`
    query PostsGetQuery
    {
      Contest {
        id
        price
        contest_name
      }
    }
    `;

     
export const GetQuestionByContestQuery = gql`
query getQuestion($contestID: Int!) {
  Contest(
    where: {id: {_eq: $contestID}}
  ) {
    id,
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
  