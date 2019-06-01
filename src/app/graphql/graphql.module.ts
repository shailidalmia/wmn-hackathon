import { NgModule } from "@angular/core";
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { stringify } from '@angular/compiler/src/util'
import { HttpHeaders, HttpClientModule } from "@angular/common/http";
@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule 
  ]
})

export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink ){
    const uri = 'https://wmn-hackathon-starks.herokuapp.com/v1/graphql'

    // const authHeader = new HttpHeaders()
    // .set()

    apollo.create({
      link: httpLink.create({uri}),
      cache: new InMemoryCache()
    });
  }
}