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
query getQuestion($contestID: jsonb) {
  contest(
    where: {id: {_eq: contestID}}
  ) {
    question
    answer
  }
  }`;
