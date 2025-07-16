import { Injectable } from '@angular/core';
import { Apollo, gql, Mutation } from 'apollo-angular';
import { GetUserResponse } from '../interfaces/user.interface'

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    active
  }
`;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apollo: Apollo) { }

  getAllUsers(options: any = {}) {
    return this.apollo.watchQuery({
      query: gql`
        query {
          users {
            ...UserFields
          }
        }
         ${USER_FIELDS} 
      `,
      fetchPolicy: options.fetchPolicy || 'cache-first'
    }).valueChanges;
  }

  getUser(id: string) {
    return this.apollo.watchQuery<GetUserResponse>({
      query: gql`
        query GetUser($id: ID!) {
          user(id: $id) {
             ...UserFields
          }
        }
         ${USER_FIELDS} 
      `,
      variables: { id }
    }).valueChanges;
  }


  createUser(name: string, email: string) {
    return this.apollo.mutate<GetUserResponse>({
      mutation: gql`
        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
          }
        }
      `,
      variables: { name, email }
    });
  }

  updateUser(id: string, name: string, email: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdateUser($id: ID!, $name: String!, $email: String!) {
        updateUser(id: $id, name: $name, email: $email) {
          id
          name
          email
        }
      }
    `,
      variables: { id, name, email }
    })
  }

  deleteUser(id: string) {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteUser($id: ID!){
        deleteUser(id: $id) 
      }
      
      `,
      variables: { id }
    })
  }

  searchUserByName(name: string) {
    return this.apollo.watchQuery({
      query: gql`
       query searchUser($name: String!){
        searchUser(name:$name){
         ...UserFields
       }
       }
       ${USER_FIELDS} 
      `,
      variables: { name }
    }).valueChanges;
  }

  searchUserByDomain(domain: string) {
    return this.apollo.watchQuery({
      query: gql`
       query searchUsersByDomain($domain: String!){
        searchUsersByDomain(domain: $domain){
         ...UserFields
        }
       }
        ${USER_FIELDS} 
      `,
      variables: { domain }
    }).valueChanges;
  }

  deactivateAllUsers() {
    return this.apollo.mutate<{ deactivateAllUsers: boolean }>({
      mutation: gql`
       mutation {
        deactivateAllUsers
       }
      `
    })
    
  }
  toggleUserStatus(id: string) {
    return this.apollo.mutate({
      mutation: gql`
      mutation  toggleUserStatus($id:ID!){
        toggleUserStatus(id:$id){
        ...UserFields
        }
       }
        ${USER_FIELDS} 
      `,
      variables: { id }
    })
    
  }

}
