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
    question
  }
  }`;


  export const GetQuestionByContestQuery2 = gql`
  {
    Contest {
      question
      answer
    }
    Contest_by_pk(id: 10) {
      id
    }
  }`;
  